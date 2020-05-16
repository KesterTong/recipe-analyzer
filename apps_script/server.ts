// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * NOTE: This code is only intended to be called from Apps Script, not in the
 * client.  From the point of view of the client this is server-side code.
 */

import { Recipe, Ingredient } from "../src/document/Document";

function parseToc(
  toc: GoogleAppsScript.Document.TableOfContents
): { [index: string]: string } {
  let tocNumChildren = toc.getNumChildren();
  let result: { [index: string]: string } = {};
  for (let i = 0; i < tocNumChildren; i++) {
    let child = toc.getChild(i);
    if (child.getType() != DocumentApp.ElementType.PARAGRAPH) {
      continue;
    }
    let paragraph = child.asParagraph();
    if (paragraph.getLinkUrl() == null) {
      continue;
    }
    result[paragraph.getText()] = paragraph.getLinkUrl();
  }
  return result;
}

function parseIngredient(
  row: GoogleAppsScript.Document.TableRow,
  numNutrients: number
): Ingredient | null {
  if (row.getNumCells() != 3 + numNutrients) {
    return null;
  }
  let nutrientValues = [];
  for (let j = 3; j < 3 + numNutrients; j++) {
    nutrientValues.push(row.getCell(j).getText());
  }
  return {
    amount: row.getCell(0).getText(),
    unit: row.getCell(1).getText(),
    ingredient: {
      description: row.getCell(2).getText(),
      url: row.getCell(2).getLinkUrl(),
    },
    nutrientValues,
  };
}

function parseTable(
  document: GoogleAppsScript.Document.Document,
  url: string,
  title: string,
  table: GoogleAppsScript.Document.Table
): Recipe | null {
  let tableNumRows = table.getNumRows();
  if (tableNumRows < 2) {
    return null;
  }
  let headerRow = table.getRow(0);
  let tableNumCols = headerRow.getNumCells();
  if (tableNumCols < 3) {
    return null;
  }
  let nutrientNames = [];
  for (let j = 3; j < tableNumCols; j++) {
    nutrientNames.push(headerRow.getCell(j).getText());
  }
  let ingredients = [];
  for (let i = 1; i < tableNumRows - 1; i++) {
    let ingredientRow = table.getRow(i);
    let ingredient = parseIngredient(ingredientRow, nutrientNames.length);
    if (ingredient == null) {
      return null;
    }
    ingredients.push(ingredient);
  }
  // Parse total row like an ingredient but ignore everything
  // except nutrient values.
  let totalRow = table.getRow(tableNumRows - 1);
  if (totalRow.getNumCells() != tableNumCols) {
    return null;
  }
  let totalNutrientValues = [];
  for (let j = 3; j < tableNumCols; j++) {
    totalNutrientValues.push(totalRow.getCell(j).getText());
  }
  // Add a NamedRange for later reference.
  let rangeBuilder = document.newRange();
  rangeBuilder.addElement(table);
  let namedRange = document.addNamedRange(
    INGREDIENTS_TABLE_RANGE_NAME,
    rangeBuilder.build()
  );
  return {
    rangeId: namedRange.getId(),
    title,
    url,
    nutrientNames,
    ingredients,
    totalNutrientValues,
  };
}

const RECIPE_TITLE_HEADING_LEVEL = DocumentApp.ParagraphHeading.HEADING1;

const INGREDIENTS_TABLE_RANGE_NAME = "RecipeEditor-ingredients-table";

export function parseDocument(
  document: GoogleAppsScript.Document.Document
): Recipe[] {
  document = DocumentApp.getActiveDocument();

  // Remove existing `NamedRange`s that we use to keep track of
  // Tables
  document
    .getNamedRanges(INGREDIENTS_TABLE_RANGE_NAME)
    .forEach((namedRange) => {
      namedRange.remove();
    });

  let body = document.getBody();
  let bodyNumChildren = body.getNumChildren();
  let i = 0;

  // Search for TOC
  let headingUrlByTitle: { [index: string]: string } | null = null;
  for (; i < bodyNumChildren; i++) {
    let child = body.getChild(i);
    if (child.getType() == DocumentApp.ElementType.TABLE_OF_CONTENTS) {
      headingUrlByTitle = parseToc(child.asTableOfContents());
      break;
    }
  }
  if (headingUrlByTitle == null) {
    throw Error("Could not find table of contents.");
  }

  let recipes = [];
  let currentTitle = null;
  for (; i < bodyNumChildren; i++) {
    let child = body.getChild(i);
    if (child.getType() == DocumentApp.ElementType.PARAGRAPH) {
      let paragraph = child.asParagraph();
      if (paragraph.getHeading() == RECIPE_TITLE_HEADING_LEVEL) {
        currentTitle = paragraph.getText();
      }
    } else if (child.getType() == DocumentApp.ElementType.TABLE) {
      if (currentTitle != null) {
        let url = headingUrlByTitle[currentTitle];
        if (url === undefined) {
          throw Error(
            "Could not match title " +
              currentTitle +
              " in table of contents.  The table of contents may require refreshing."
          );
        }
        let recipe = parseTable(document, url, currentTitle, child.asTable());
        if (recipe != null) {
          recipes.push(recipe);
        }
        currentTitle = null;
      }
    } else if (child.getType() == DocumentApp.ElementType.PAGE_BREAK) {
      // Clear heading whenever we reach a page break.
      currentTitle = null;
    }
  }
  return recipes;
}

function getTable(rangeId: string): GoogleAppsScript.Document.Table {
  const document = DocumentApp.getActiveDocument();
  const namedRange = document.getNamedRangeById(rangeId);
  if (namedRange === null) {
    throw new Error("Could not find range with id: " + rangeId);
  }
  const elements = namedRange.getRange().getSelectedElements();
  if (elements.length != 1) {
    throw new Error("Expected 1 element in range");
  }
  const element = elements[0].getElement();
  if (element.getType() != DocumentApp.ElementType.TABLE) {
    throw new Error("Expected range to contain a table");
  }
  return element.asTable();
}

export function addIngredient(rangeId: string) {
  const table = getTable(rangeId);
  const row = table.getRow(1).copy();
  const numCells = row.getNumCells();
  for (let i = 0; i < numCells; i++) {
    row.getCell(i).clear();
  }
  table.insertTableRow(table.getNumRows() - 1, row);
}

export function updateIngredient(
  rangeId: string,
  ingredientIndex: number,
  ingredient: Ingredient
) {
  const table = getTable(rangeId);
  // We add 1 because the first row is the header row.
  const row = table.getRow(ingredientIndex + 1);
  // TODO: handle nutrients also.
  row.getCell(0).setText(ingredient.amount);
  row.getCell(1).setText(ingredient.unit);
  row.getCell(2).setText(ingredient.ingredient.description);
  // The type of setLinkUrl is wrong (it should accept null) so
  // we cast to string here.
  row.getCell(2).setLinkUrl(ingredient.ingredient.url as string);
}

export function testParseDocument() {
  const document = DocumentApp.getActiveDocument();
  console.log(JSON.stringify(parseDocument(document), undefined, 2));
}
