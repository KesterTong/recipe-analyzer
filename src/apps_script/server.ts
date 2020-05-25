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

import { Recipe, Ingredient, Update, UpdateType } from "../core";
import { Config } from "../config/config";

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

function parseIngredient(row: GoogleAppsScript.Document.TableRow): Ingredient {
  if (row.getNumCells() != 3) {
    throw new Error("Not all rows in table had 3 cells");
  }
  return {
    amount: row.getCell(0).getText(),
    unit: row.getCell(1).getText(),
    ingredient: {
      description: row.getCell(2).getText(),
      url: row.getCell(2).getLinkUrl(),
    },
  };
}

function parseTable(
  url: string,
  title: string,
  table: GoogleAppsScript.Document.Table
): Recipe {
  let tableNumRows = table.getNumRows();
  // Require 3 rows as each recipe must have at least 1 ingredient.
  if (tableNumRows < 1) {
    throw new Error("Table must have at least 1 row");
  }
  let headerRow = table.getRow(0);
  let tableNumCols = headerRow.getNumCells();
  if (tableNumCols != 3) {
    throw new Error("Table must have 3 columns");
  }
  let ingredients = [];
  for (let i = 0; i < tableNumRows; i++) {
    let ingredientRow = table.getRow(i);
    let ingredient = parseIngredient(ingredientRow);
    ingredients.push(ingredient);
  }
  return {
    title,
    url,
    ingredients,
  };
}

const RECIPE_TITLE_HEADING_LEVEL = DocumentApp.ParagraphHeading.HEADING1;

export function parseDocument(): Recipe[] {
  let document = DocumentApp.getActiveDocument();

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
      if (currentTitle == null) {
        throw new Error("Not title found for table");
      }
      let url = headingUrlByTitle[currentTitle];
      if (url === undefined) {
        throw Error(
          "Could not match title " +
            currentTitle +
            " in table of contents.  The table of contents may require refreshing."
        );
      }
      recipes.push(parseTable(url, currentTitle, child.asTable()));
      currentTitle = null;
    } else if (child.getType() == DocumentApp.ElementType.PAGE_BREAK) {
      // Clear heading whenever we reach a page break.
      currentTitle = null;
    }
  }
  return recipes;
}

export function updateDocument(update: Update) {
  const document = DocumentApp.getActiveDocument();
  const table = document.getBody().getTables()[update.recipeIndex];
  switch (update.type) {
    case UpdateType.ADD_INGREDIENT:
      // Copy new row from existing row to get same styling.
      const newRow = table.getRow(0).copy();
      const numCells = newRow.getNumCells();
      for (let i = 0; i < numCells; i++) {
        newRow.getCell(i).clear();
      }
      table.appendTableRow(newRow);
      break;
    case UpdateType.UPDATE_INGREDIENT:
      const row = table.getRow(update.ingredientIndex);
      // TODO: handle nutrients also.
      if (update.newAmount) {
        row.getCell(0).setText(update.newAmount);
      }
      if (update.newUnit) {
        row.getCell(1).setText(update.newUnit);
      }
      if (update.newFood) {
        row.getCell(2).setText(update.newFood.description);
        // The type of setLinkUrl is wrong (it should accept null) so
        // we cast to string here.
        row.getCell(2).setLinkUrl(update.newFood.url as string);
      }
      break;
    case UpdateType.DELETE_INGREDIENT:
      table.removeRow(update.ingredientIndex);
      break;
    case UpdateType.SWAP_INGREDIENTS:
      const second_row = table.getRow(update.firstIngredientIndex + 1);
      second_row.removeFromParent();
      table.insertTableRow(update.firstIngredientIndex, second_row);
      break;
  }
}

/**
 * Select a recipe
 *
 * This is called when a user selects a recipe in the UI.
 *
 * This function sets the cursor to the start of that recipe
 * so users can see the changes in the doc as they update the
 * recipe.
 *
 * @param recipeIndex The index of the selected recipe
 */
export function selectRecipe(recipeIndex: number) {
  const document = DocumentApp.getActiveDocument();
  const table = document.getBody().getTables()[recipeIndex];
  const previousElement = table.getPreviousSibling();
  document.setCursor(document.newPosition(previousElement, 0));
}

const CONFIG_KEY = "RECIPE_ANALYZER_CONFIG";

export function getConfig(): Config {
  const value = PropertiesService.getScriptProperties().getProperty(CONFIG_KEY);
  if (value === null) {
    throw Error("No config found");
  }
  return JSON.parse(value);
}

export function testParseDocument() {
  console.log(JSON.stringify(parseDocument(), undefined, 2));
}
