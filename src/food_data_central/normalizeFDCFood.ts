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

import { Quantity } from "../core/Quantity";
import { ConversionData } from "../core/canonicalizeQuantity";
import { Nutrients } from "../core/Nutrients";
import { FDCFood } from "./FoodDataCentral";
import { Food } from "../core/Food";
import { srLegacyServingEquivalents } from "./srLegacyServingEquivalents";
import { brandedServingEquivalents } from "./brandedServingEquivalents";

export function normalizeFDCFood(
  food: FDCFood,
  conversionData: ConversionData
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
      servingEquivalents =  srLegacyServingEquivalents(food, conversionData);
      break;
    case "Branded":
      servingEquivalents =  brandedServingEquivalents(food, conversionData);
      break;
  }
  return {
    description: food.description,
    nutrientsPerServing,
    servingEquivalents,
  };
}


