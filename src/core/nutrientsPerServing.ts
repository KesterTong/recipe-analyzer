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

import { canonicalizeQuantity } from "./Quantity";
import { Nutrients, addNutrients, scaleNutrients } from "./Nutrients";
import { SRLegacyFood, BrandedFood, FDCFood } from "./FoodDataCentral";
import { parseQuantity } from "./parseQuantity";
import { Food } from "./Food";
import { Recipe, Ingredient } from "./Recipe";
import { StatusOr, StatusCode, status, isOk, hasCode } from "./StatusOr";

export function nutrientsPerServingForFood(
  food: Food,
  foodCache: { [index: string]: Food } = {}
): StatusOr<Nutrients> {
  if (food === undefined) {
    return status(StatusCode.LOADING);
  }
  switch (food.dataType) {
    case "SR Legacy":
    case "Branded":
      return nutrientsPerServingForFDCFood(food);
    case "Recipe":
      return nutrientsForRecipe(food, foodCache);
  }
}

function nutrientsPerServingForFDCFood(foodDetails: FDCFood): Nutrients {
  const result: Nutrients = {};
  for (var i = 0; i < foodDetails.foodNutrients.length; i++) {
    var foodNutrient = foodDetails.foodNutrients[i];
    var nutrientId = foodNutrient.nutrient.id;
    var nutrientAmount = foodNutrient.amount || 0;
    result[nutrientId.toString()] = nutrientAmount;
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

function nutrientsForRecipe(
  food: Recipe,
  foodCache: { [index: string]: Food }
): StatusOr<Nutrients> {
  return totalNutrients(
    food.ingredientsList.map((ingredient) =>
      nutrientsForIngredient(ingredient, foodCache)
    )
  );
}

export function nutrientsForIngredient(
  ingredient: Ingredient,
  foodCache: { [index: string]: Food }
): StatusOr<Nutrients> {
  const foodId = ingredient.foodId;
  const food = foodCache[foodId];
  if (food === undefined) {
    return status(StatusCode.LOADING);
  }
  const nutrientsPerServing = nutrientsPerServingForFood(food, foodCache);
  if (!isOk(nutrientsPerServing)) {
    return nutrientsPerServing;
  }
  if (isNaN(ingredient.quantity.amount)) {
    return status(StatusCode.NAN_AMOUNT);
  }
  return nutrientsForQuantity(
    ingredient.quantity.amount,
    ingredient.quantity.unit,
    servingEquivalentQuantities(food),
    nutrientsPerServing
  );
}

export function totalNutrients(
  nutrientsPerIngredient: StatusOr<Nutrients>[]
): StatusOr<Nutrients> {
  if (nutrientsPerIngredient.every((value) => isOk(value))) {
    return (nutrientsPerIngredient as Nutrients[]).reduce(addNutrients, {});
  } else if (
    nutrientsPerIngredient.every(
      (value) => isOk(value) || hasCode(value, StatusCode.LOADING)
    )
  ) {
    return status(StatusCode.LOADING);
  } else {
    return status(StatusCode.INGREDIENT_ERROR);
  }
}

export function servingEquivalentQuantities(food: Food) {
  switch (food.dataType) {
    case "SR Legacy":
      return SRLegacyServingEquivalentQuantities(food);
    case "Branded":
      return brandedServingEquivalentQuantities(food);
    case "Recipe":
      return { serving: 1 };
  }
}

function SRLegacyServingEquivalentQuantities(foodDetails: SRLegacyFood) {
  // A serving is 100g for SR Legacy data.
  let result: { [index: string]: number } = {
    g: 100.0,
  };
  // Add in other measures
  for (let i = 0; i < foodDetails.foodPortions.length; i++) {
    const foodPortion = foodDetails.foodPortions[i];
    const [amount, unit] = canonicalizeQuantity(
      foodPortion.amount,
      foodPortion.modifier
    );
    // The gram weight is for `amount` of `unitName` so for
    // a single unit of `unitName` we divide by `amount`.
    result[unit] = (100.0 * amount) / foodPortion.gramWeight;
  }
  return result;
}

function brandedServingEquivalentQuantities(foodDetails: BrandedFood) {
  let result: { [index: string]: number } = {
    [foodDetails.servingSizeUnit]: 100.0,
  };
  let householdServingQuantity =
    foodDetails.householdServingFullText == null
      ? null
      : parseQuantity(foodDetails.householdServingFullText);
  if (householdServingQuantity != null) {
    const [amount, unit] = canonicalizeQuantity(
      householdServingQuantity.amount,
      householdServingQuantity.unit
    );
    result[unit] = (100.0 * amount) / foodDetails.servingSize;
  }
  return result;
}
