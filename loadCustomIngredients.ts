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
import { FDCFood, CustomFood } from "./core/FoodDetails";

export function loadCustomIngredients(document: GoogleAppsScript.Document.Document, bookmarkManager: BookmarkManager, fdcClient: IngredientDatabase) {
  let ingredientsTable = getIngredientsTable(document);
  if (ingredientsTable == null) {
    return;
  }
  let numRows = ingredientsTable.getNumRows();
  // Iterate over all rows except the header row
  for (let rowIndex = 1; rowIndex < numRows; rowIndex++) {
    let row = ingredientsTable.getRow(rowIndex);
    var foodDetails = parseRow(row, bookmarkManager);
    if (foodDetails == null) {
      continue;
    }
    fdcClient.addCustomFood(foodDetails);
  }
}

function parseRow(row: GoogleAppsScript.Document.TableRow, bookmarkManager: BookmarkManager): CustomFood | null {
  if (row.getNumCells() != 4) {
    return null;
  }
  let bookmarkId = bookmarkManager.bookmarkIdForElement(row.getCell(0));
  if (bookmarkId == null) {
    return null;
  }  
  let householdServing = parseHouseholdServing(row.getCell(1).getText());
  if (householdServing == null) {
    return null;
  }
  // Label nutrients are per household unit, while the serving size is 100 g/mL.
  // So we convert using the scale factor below.
  let scale = 100.0 / householdServing.servingSize;
  return {
    dataType: 'Custom',
    bookmarkId: bookmarkId,
    description: row.getCell(0).getText(),
    servingSize: householdServing.servingSize,
    servingSizeUnit: householdServing.servingSizeUnit,
    householdServingFullText: householdServing.householdServingFullText,
    foodNutrients: [
      {
        nutrient: {id: 1008},  // calories
        amount: Number(row.getCell(2).getText()) * scale,
      },
      {
        nutrient: {id: 1003},  // protein
        amount: Number(row.getCell(3).getText()) * scale,
      },
    ],
  };
}

function getIngredientsTable(document: GoogleAppsScript.Document.Document): GoogleAppsScript.Document.Table | null {
  let tables = document.getBody().getTables();
  if (tables.length == 0) {
    return null;
  }
  return tables[tables.length - 1];
}
