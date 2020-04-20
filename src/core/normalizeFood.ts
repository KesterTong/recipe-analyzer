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
import { Nutrients, addNutrients } from "./Nutrients";
import {
  SRLegacyFood,
  BrandedFood,
  nutrientsPerServingForFDCFood,
} from "./FoodDataCentral";
import { parseQuantity } from "./parseQuantity";
import { Food } from "./Food";
import { nutrientsForQuantity, Recipe } from "./Recipe";

export function nutrientsPerServingForFood(
  food: Food,
  foodCache: { [index: string]: Food },
  nutrientIds: number[]
): Nutrients {
  switch (food.dataType) {
    case "SR Legacy":
    case "Branded":
      return nutrientsPerServingForFDCFood(food, nutrientIds);
    case "Recipe":
      return nutrientsForRecipe(food, foodCache, nutrientIds);
  }
}

function nutrientsForRecipe(
  food: Recipe,
  foodCache: { [index: string]: Food },
  nutrientIds: number[]
): Nutrients {
  const nutrients = food.ingredientsList.map((ingredient) => {
    const subFood = foodCache[ingredient.foodId];
    const nutrientsPerServing = nutrientsPerServingForFood(
      subFood,
      foodCache,
      nutrientIds
    );
    const { amount, unit } = ingredient.quantity;
    return nutrientsForQuantity(
      amount,
      unit,
      servingEquivalentQuantities(subFood),
      nutrientsPerServing
    );
  });
  return nutrients.reduce(addNutrients);
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
      householdServingQuantity[0],
      householdServingQuantity[1]
    );
    result[unit] = (100.0 * amount) / foodDetails.servingSize;
  }
  return result;
}
