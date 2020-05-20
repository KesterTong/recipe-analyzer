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

import { canonicalizeQuantity, Quantity } from "./Quantity";
import { Nutrients, addNutrients, scaleNutrients } from "./Nutrients";
import { SRLegacyFood, BrandedFood, FDCFood } from "./FoodDataCentral";
import { NormalizedFood } from "./NormalizedFood";

/**
 * Parse a quantity, e.g. "1 cup"
 */
function parseQuantity(text: string): Quantity | null {
  const fractionValueBySymbol: { [index: string]: number } = {
    "": 0,
    "½": 1 / 2,
    "⅓": 1 / 3,
    "⅔": 2 / 3,
    "¼": 1 / 4,
    "¾": 3 / 4,
    "⅕": 1 / 5,
    "⅖": 2 / 5,
    "⅗": 3 / 5,
    "⅘": 4 / 5,
    "⅙": 1 / 6,
    "⅚": 5 / 6,
    "⅐": 1 / 7,
    "⅛": 3 / 8,
    "⅜": 3 / 8,
    "⅝": 5 / 7,
    "⅞": 7 / 8,
    "⅑": 1 / 9,
    "⅒": 1 / 10,
  };
  let match = text.match(
    /(\s*(\d*\.?\d*)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒]?)\s*(\w*)\s*)(.*)/
  );
  if (match == null) {
    return null;
  }
  return {
    amount:
      Number(match[2] || (match[3] ? 0.0 : 1.0)) +
      fractionValueBySymbol[match[3]],
    unit: match[4].trim() || "serving",
  };
}

export function normalizeFDCFood(food: FDCFood): NormalizedFood {
  const nutrientsPerServing: Nutrients = {};
  for (var i = 0; i < food.foodNutrients.length; i++) {
    var foodNutrient = food.foodNutrients[i];
    var nutrientId = foodNutrient.nutrient.id;
    var nutrientAmount = foodNutrient.amount || 0;
    nutrientsPerServing[nutrientId.toString()] = nutrientAmount;
  }
  return {
    description: food.description,
    nutrientsPerServing,
    servingEquivalents: servingEquivalentQuantities(food),
  };
}

function servingEquivalentQuantities(food: FDCFood): Quantity[] {
  switch (food.dataType) {
    case "SR Legacy":
      return SRLegacyServingEquivalentQuantities(food);
    case "Branded":
      return brandedServingEquivalentQuantities(food);
  }
}

function SRLegacyServingEquivalentQuantities(food: SRLegacyFood): Quantity[] {
  // A serving is 100 g by definition for SR Legacy foods.
  let result = [{ amount: 100, unit: "g" }];
  for (let i = 0; i < food.foodPortions.length; i++) {
    const foodPortion = food.foodPortions[i];
    const { amount, unit } = canonicalizeQuantity({
      amount: foodPortion.amount,
      unit: foodPortion.modifier,
    });
    const amountPerServing = (100.0 * amount) / foodPortion.gramWeight;
    result.push({ amount: amountPerServing, unit });
  }
  return result;
}

function brandedServingEquivalentQuantities(food: BrandedFood): Quantity[] {
  // A serving is 100 g or 100 ml depending on servingSizeUnit, for Branded foods.
  let result = [{ amount: 100, unit: food.servingSizeUnit }];
  let householdServingQuantity =
    food.householdServingFullText == null
      ? null
      : parseQuantity(food.householdServingFullText);
  if (householdServingQuantity != null) {
    const { amount, unit } = canonicalizeQuantity({
      amount: householdServingQuantity.amount,
      unit: householdServingQuantity.unit,
    });
    const amountPerServing = (100.0 * amount) / food.servingSize;
    result.push({ amount: amountPerServing, unit });
  }
  return result;
}

// // Used to compute ingredient quantity
// export function nutrientsForQuantity(
//   amount: number,
//   unit: string,
//   servingEquivalentQuantities: { [index: string]: number },
//   nutrientsPerServing: Nutrients
// ): StatusOr<Nutrients> {
//   [amount, unit] = canonicalizeQuantity(amount, unit);
//   // The number of units of the quantity per serving.
//   let unitsPerServing = servingEquivalentQuantities[unit];
//   if (unitsPerServing == undefined) {
//     // TODO: Display original unit as well as canonicalized unit in error.
//     return status(StatusCode.UNKNOWN_QUANTITY, unit);
//   }
//   var servings = amount / unitsPerServing;
//   return scaleNutrients(nutrientsPerServing, servings);
// }

// export function nutrientsForIngredient(
//   ingredient: Ingredient,
//   foodCache: { [index: string]: Food }
// ): StatusOr<Nutrients> {
//   const foodId = ingredient.foodId;
//   const food = foodCache[foodId];
//   if (food === undefined) {
//     return status(StatusCode.LOADING);
//   }
//   const nutrientsPerServing = nutrientsPerServingForFood(food, foodCache);
//   if (!isOk(nutrientsPerServing)) {
//     return nutrientsPerServing;
//   }
//   if (isNaN(ingredient.quantity.amount)) {
//     return status(StatusCode.NAN_AMOUNT);
//   }
//   return nutrientsForQuantity(
//     ingredient.quantity.amount,
//     ingredient.quantity.unit,
//     servingEquivalentQuantities(food),
//     nutrientsPerServing
//   );
// }

// export function totalNutrients(
//   nutrientsPerIngredient: StatusOr<Nutrients>[]
// ): StatusOr<Nutrients> {
//   if (nutrientsPerIngredient.every((value) => isOk(value))) {
//     return (nutrientsPerIngredient as Nutrients[]).reduce(addNutrients, {});
//   } else if (
//     nutrientsPerIngredient.every(
//       (value) => isOk(value) || hasCode(value, StatusCode.LOADING)
//     )
//   ) {
//     return status(StatusCode.LOADING);
//   } else {
//     return status(StatusCode.INGREDIENT_ERROR);
//   }
// }
