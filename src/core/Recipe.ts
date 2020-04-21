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
import { Nutrients, scaleNutrients } from "./Nutrients";
import { canonicalizeQuantity } from "./Quantity";
import { StatusOr, StatusCode, status } from "./StatusOr";

export interface Ingredient {
  quantity: { amount: number; unit: string };
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

/**
 * Get a list of ingredient units to display.
 */
export function getIngredientUnits(servingEquivalentQuantities: {
  [index: string]: number;
}): string[] {
  let result = Object.keys(servingEquivalentQuantities).filter(
    (unit) => unit != "g" && unit != "ml"
  );
  if (servingEquivalentQuantities["g"] !== undefined) {
    result = result.concat(["g", "oz", "lb", "kg"]);
  }
  if (servingEquivalentQuantities["ml"] !== undefined) {
    result = result.concat(["tsp", "tbsp", "cup"]);
  }
  return result;
}

// Used to compute ingredient quantity
export function nutrientsForQuantity(
  amount: number,
  unit: string,
  servingEquivalentQuantities: { [index: string]: number },
  nutrientsPerServing: Nutrients
): StatusOr<Nutrients> {
  [amount, unit] = canonicalizeQuantity(amount, unit);
  // The number of units of the quantity per serving.
  let unitsPerServing = servingEquivalentQuantities[unit];
  if (unitsPerServing == undefined) {
    // TODO: Display original unit as well as canonicalized unit in error.
    return status(StatusCode.UNKNOWN_QUANTITY, unit);
  }
  var servings = amount / unitsPerServing;
  return scaleNutrients(nutrientsPerServing, servings);
}
