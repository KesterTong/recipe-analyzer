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

import { Quantity } from "./Quantity";
import { NormalizedFood } from "./NormalizedFood";
import { Nutrients, scaleNutrients } from "./Nutrients";

export interface Ingredient {
  quantity: Quantity;
  foodId: string;
}

// Note that Ingredient (and Recipe) store their nutritional values,
// even though these could becomputed from the ingredients.
//
// This is a form of database normalization since Recipe might be stored
// in a database and so storing the nutritional values avoids extra lookups.
export interface Recipe {
  dataType: "Recipe";
  description: string;
  // Note this is distinct from the ingredients field which is a text field
  // used for FDC foods.
  ingredientsList: Ingredient[];
}

// Used to compute ingredient quantity
export function nutrientsForQuantity(
  quantity: Quantity,
  foodData: NormalizedFood
): Nutrients {
  // The number of units of the quantity per serving.
  let unitsPerServing = foodData.servingEquivalentQuantities[quantity.unit];
  if (unitsPerServing == undefined) {
    // TODO: Display original unit as well as canonicalized unit in error.
    throw "Could not determine nutrients for quantity " + quantity.unit;
  }
  var servings = quantity.amount / unitsPerServing;
  return scaleNutrients(foodData.nutrientsPerServing, servings);
}
