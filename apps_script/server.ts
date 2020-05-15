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

import {
  Document,
  RecipeTable,
  IngredientRow,
  TocEntry,
} from "../src/document/Document";

function parseToc(toc: GoogleAppsScript.Document.TableOfContents): TocEntry[] {
  let tocNumChildren = toc.getNumChildren();
  let result = [];
  for (let i = 0; i < tocNumChildren; i++) {
    let child = toc.getChild(i);
    if (child.getType() != DocumentApp.ElementType.PARAGRAPH) {
      continue;
    }
    let paragraph = child.asParagraph();
    if (paragraph.getLinkUrl() == null) {
      continue;
    }
    result.push({ title: paragraph.getText(), url: paragraph.getLinkUrl() });
  }
  return result;
}

function parseIngredient(
  row: GoogleAppsScript.Document.TableRow,
  numNutrients: number
): IngredientRow | null {
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
  title: string,
  table: GoogleAppsScript.Document.Table
): RecipeTable | null {
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
    nutrientNames,
    ingredients,
    totalNutrientValues,
  };
}

const RECIPE_TITLE_HEADING_LEVEL = DocumentApp.ParagraphHeading.HEADING1;

const INGREDIENTS_TABLE_RANGE_NAME = "RecipeEditor-ingredients-table";

export function parseDocument(
  document: GoogleAppsScript.Document.Document
): Document | null {
  throw new Error("test error");
  /*
  document = DocumentApp.getActiveDocument();

  // Remove existing `NamedRange`s that we use to keep track of
  // Tables
  document
    .getNamedRanges(INGREDIENTS_TABLE_RANGE_NAME)
    .forEach((namedRange) => {
      namedRange.remove();
    });

  let toc: TocEntry[] | null = null;
  let recipes = [];
  let currentTitle = null;
  let body = document.getBody();
  let bodyNumChildren = body.getNumChildren();
  for (let i = 0; i < bodyNumChildren; i++) {
    let child = body.getChild(i);
    if (child.getType() == DocumentApp.ElementType.TABLE_OF_CONTENTS) {
      toc = parseToc(child.asTableOfContents());
    } else if (child.getType() == DocumentApp.ElementType.PARAGRAPH) {
      let paragraph = child.asParagraph();
      if (paragraph.getHeading() == RECIPE_TITLE_HEADING_LEVEL) {
        currentTitle = paragraph.getText();
      }
    } else if (child.getType() == DocumentApp.ElementType.TABLE) {
      if (currentTitle != null) {
        let recipe = parseTable(document, currentTitle, child.asTable());
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
  if (toc == null) {
    return null;
  }
  return {
    toc: toc,
    recipes: recipes,
  };
  */
}

function testParseDocument() {
  const document = DocumentApp.getActiveDocument();
  console.log(JSON.stringify(parseDocument(document), undefined, 2));
}
