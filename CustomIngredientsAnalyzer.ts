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

import { LocalIngredients } from './LocalIngredients';
import { parseServingSize } from './parseServingSize';
import { makeFoodData } from './core/FoodData';

export class CustomIngredientsAnalyzer {
  constructor(private localIngredients: LocalIngredients) { }

  parseCustomIngredientsTable(document: GoogleAppsScript.Document.Document) {
    let ingredientsTable = getIngredientsTable(document);
    if (ingredientsTable == null) {
      return;
    }
    let numRows = ingredientsTable.getNumRows();
    // Iterate over all rows except the header row
    for (let rowIndex = 1; rowIndex < numRows; rowIndex++) {
      this.parseRow(ingredientsTable.getRow(rowIndex));
    }
  }

  private parseRow(row: GoogleAppsScript.Document.TableRow) {
    if (row.getNumCells() != 4) {
      return;
    }
    let bookmarkId = this.localIngredients.bookmarkIdForElement(row.getCell(0));
    if (bookmarkId == null) {
      return;
    }
    let description = row.getCell(0).getText();
    let servingSize = parseServingSize(row.getCell(1).getText());
    let calories = Number(row.getCell(2).getText());
    let protein = Number(row.getCell(3).getText());
    let foodData = makeFoodData(
      description,
      {calories: calories, protein: protein},
      servingSize);
    this.localIngredients.insertFoodData(bookmarkId, foodData);
  }
}

function getIngredientsTable(document: GoogleAppsScript.Document.Document): GoogleAppsScript.Document.Table {
  let tables = document.getBody().getTables();
  if (tables.length == 0) {
    return null;
  }
  return tables[tables.length - 1];
}
