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

import { IngredientDatabase } from "./IngredientDatabase";
import { BookmarkManager } from "./BookmarkManager";
import { parseHouseholdServing } from "./core/parseHouseholdServing";
import { nutrientNames } from "./core/Nutrients";
import { FDCFood } from "./core/FoodDetails";

export function loadCustomIngredients(document: GoogleAppsScript.Document.Document, bookmarkManager: BookmarkManager, fdcClient: IngredientDatabase) {
  let ingredientsTable = getIngredientsTable(document);
  if (ingredientsTable == null) {
    return;
  }
  let numRows = ingredientsTable.getNumRows();
  if (numRows == 0) {
    return;
  }
  let nutrients = parseHeaderRow(ingredientsTable.getRow(0));
  if (nutrients == null) {
    return;
  }

  // Iterate over all rows except the header row
  for (let rowIndex = 1; rowIndex < numRows; rowIndex++) {
    let row = ingredientsTable.getRow(rowIndex);
    if (row.getNumCells() != nutrients.length + 2) {
      continue;
    }
    let bookmarkId = bookmarkManager.bookmarkIdForElement(row.getCell(0));
    if (bookmarkId == null) {
      continue;
    }    
    var foodDetails = parseRow(row, nutrients, bookmarkManager);
    if (foodDetails == null) {
      continue;
    }
    fdcClient.addCustomFood(bookmarkId, foodDetails);
  }
}


function parseHeaderRow(row: GoogleAppsScript.Document.TableRow): number[] | null {
  let numCells = row.getNumCells();
  if (numCells <= 2) {
    return null;
  }
  let nutrientIdsByDescription: {[index: string]: number} = {};
  let nutrientNamesById : {[index: number]: string} = nutrientNames();
  for (let key in nutrientNamesById) {
    let nutrientId = Number(key);
    nutrientIdsByDescription[nutrientNamesById[nutrientId]] = nutrientId;
  }
  let result: number[] = [];
  for (let cellIndex = 2; cellIndex < numCells; cellIndex++) {
    let nutrientId = nutrientIdsByDescription[row.getCell(cellIndex).getText()];
    if (nutrientId == null) {
      return null;
    }
    result.push(nutrientId);
  }
  return result;
}

function parseRow(row: GoogleAppsScript.Document.TableRow, nutrients: number[], bookmarkManager: BookmarkManager): FDCFood | null {
  let householdServing = parseHouseholdServing(row.getCell(1).getText());
  if (householdServing == null) {
    return null;
  }

  // Label nutrients are per household unit, while the serving size is 100 g/mL.
  // So we convert using the scale factor below.
  let scale = 100.0 / householdServing.servingSize;
  let foodNutrients: {nutrient: {id: number}, amount?: number}[] = [];
  for (let i = 0; i < nutrients.length; i++) {
    foodNutrients.push({
      nutrient: {id: nutrients[i]},
      amount: Number(row.getCell(i + 2).getText()) * scale,
    });
  }

  return {
    dataType: 'Branded',
    description: row.getCell(0).getText(),
    servingSize: householdServing.servingSize,
    servingSizeUnit: householdServing.servingSizeUnit,
    householdServingFullText: householdServing.householdServingFullText,
    foodNutrients: foodNutrients,
  };
}

function getIngredientsTable(document: GoogleAppsScript.Document.Document): GoogleAppsScript.Document.Table | null {
  let tables = document.getBody().getTables();
  if (tables.length == 0) {
    return null;
  }
  return tables[tables.length - 1];
}
