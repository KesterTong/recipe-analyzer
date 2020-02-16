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

import { IngredientDatabase } from "./core/IngredientDatabase";
import { DocumentAdaptor } from "./appsscript/DocumentAdaptor";
import { parseHouseholdServing } from "./core/parseHouseholdServing";
import { nameForNutrient, idForNutrient } from "./core/Nutrients";

export function loadCustomIngredients(documentAdaptor: DocumentAdaptor, fdcClient: IngredientDatabase) {
  let ingredientsTable = documentAdaptor.getCustomIngredientsTable();
  if (ingredientsTable == null) {
    return;
  }
  let nutrientsColumnNames = ingredientsTable.nutrientNames();
  if (nutrientsColumnNames == null) {
    return;
  }
  let nutrients = nutrientsColumnNames.map(idForNutrient);

  // Iterate over all rows except the header row
  ingredientsTable.ingredientRows().forEach(ingredientsTableRowAdaptor => {
    let bookmarkId = ingredientsTableRowAdaptor.bookmarkId();
    if (bookmarkId == null) {
      return;
    }
    let description = ingredientsTableRowAdaptor.description();
    let householdServingStr = ingredientsTableRowAdaptor.householdServingStr();
    let householdServing = parseHouseholdServing(householdServingStr);
    if (householdServing == null) {
      return null;
    }

    // Label nutrients are per household unit, while the serving size is 100 g/mL.
    // So we convert using the scale factor below.
    let nutrientsPerHouseholdServing = ingredientsTableRowAdaptor.nutrientValues();
    let scale = 100.0 / householdServing.servingSize;
    let foodNutrients: {nutrient: {id: number}, amount?: number}[] = [];
    for (let i = 0; i < nutrients.length; i++) {
      foodNutrients.push({
        nutrient: {id: nutrients[i]!},
        amount: nutrientsPerHouseholdServing[i] * scale,
      });
    }

    fdcClient.patchFood({
      identifierType: 'BookmarkId',
      bookmarkId: bookmarkId,
    }, {
      dataType: 'Branded',
      description: description,
      servingSize: householdServing.servingSize,
      servingSizeUnit: householdServing.servingSizeUnit,
      householdServingFullText: householdServing.householdServingFullText,
      foodNutrients: foodNutrients,
    });
  });
}
