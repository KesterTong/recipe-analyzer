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

import { FdcFood, BrandedFood, SrLegacyFood } from "./FdcFood";
import {
  Quantity,
  canonicalizeQuantity,
  Food,
  Nutrients,
  parseQuantity,
  CanonicalizeQuantityConfig,
} from "../core";

export function brandedServingEquivalents(
  food: BrandedFood,
  config: CanonicalizeQuantityConfig
): Quantity[] {
  // A serving is 100 g or 100 ml depending on servingSizeUnit, for Branded foods.
  let result = [{ amount: 100, unit: food.servingSizeUnit }];
  let householdServingQuantity =
    food.householdServingFullText == null
      ? null
      : parseQuantity(food.householdServingFullText);
  if (householdServingQuantity != null) {
    const { amount, unit } = canonicalizeQuantity(
      {
        amount: householdServingQuantity.amount,
        unit: householdServingQuantity.unit,
      },
      config
    );
    const amountPerServing = (100.0 * amount) / food.servingSize;
    result.push({ amount: amountPerServing, unit });
  }
  return result;
}

export function srLegacyServingEquivalents(
  food: SrLegacyFood,
  config: CanonicalizeQuantityConfig
): Quantity[] {
  // A serving is 100 g by definition for SR Legacy foods.
  let result = [{ amount: 100, unit: "g" }];
  for (let i = 0; i < food.foodPortions.length; i++) {
    const foodPortion = food.foodPortions[i];
    const { amount, unit } = canonicalizeQuantity(
      {
        amount: foodPortion.amount,
        unit: foodPortion.modifier,
      },
      config
    );
    const amountPerServing = (100.0 * amount) / foodPortion.gramWeight;
    result.push({ amount: amountPerServing, unit });
  }
  return result;
}

export function normalizeFDCFood(
  food: FdcFood,
  config: CanonicalizeQuantityConfig
): Food {
  const nutrientsPerServing: Nutrients = {};
  for (var i = 0; i < food.foodNutrients.length; i++) {
    var foodNutrient = food.foodNutrients[i];
    var nutrientId = foodNutrient.nutrient.id;
    var nutrientAmount = foodNutrient.amount || 0;
    nutrientsPerServing[nutrientId.toString()] = nutrientAmount;
  }
  let servingEquivalents: Quantity[];
  switch (food.dataType) {
    case "SR Legacy":
      servingEquivalents = srLegacyServingEquivalents(food, config);
      break;
    case "Branded":
      servingEquivalents = brandedServingEquivalents(food, config);
      break;
  }
  return {
    description: food.description,
    nutrientsPerServing,
    servingEquivalents,
  };
}
