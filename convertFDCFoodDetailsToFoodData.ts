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

import { Quantity } from './core/Quantity';
import { Nutrients } from "./core/Nutrients";
import { FoodData, makeFoodData } from "./core/FoodData";
import { FoodDetails } from './core/FoodDetails';

export function convertFDCFoodDetailsToFoodData(foodDetails: FoodDetails): FoodData {
  let nutrientsPerServing = nutrientsFromFoodDetails(foodDetails);
  if (nutrientsPerServing == null) {
    return null;
  }
  return makeFoodData(foodDetails.description, nutrientsPerServing, servingEquivalentQuantitiesFromFoodDetails(foodDetails));
}

export function nutrientsFromFoodDetails(foodDetails: FoodDetails): Nutrients {
  var calories = 0;
  var protein = 0;
  for (var i = 0; i < foodDetails.foodNutrients.length; i++) {
    var foodNutrient = foodDetails.foodNutrients[i];
    var nutrientId = foodNutrient.nutrient.id;
    var nutrientAmount = foodNutrient.amount || 0;
    if (nutrientId == 1008) {
      calories = nutrientAmount;
    } else if (nutrientId == 1003) {
      protein = nutrientAmount;
    }
  }
  return {calories: calories, protein: protein};
}

export function servingEquivalentQuantitiesFromFoodDetails(foodDetails: FoodDetails): Quantity[] {
  if (foodDetails.dataType == 'Recipe') {
    return [{amount: 1.0, unit: 'serving'}];
  } else if (foodDetails.dataType == 'SR Legacy') {
    return SRLegacyServingEquivalentQuantities(foodDetails);
  } else if (foodDetails.dataType == 'Branded') {
    return brandedServingEquivalentQuantities(foodDetails);
  } else {
    throw 'Unknown DataType ' + foodDetails.dataType
  }
}

function SRLegacyServingEquivalentQuantities(foodDetails: FoodDetails) : Quantity[] {
  // A serving is 100g for SR Legacy data.
  var servingEquivalentQuantities: Quantity[] = [{
    amount: 100.0,
    unit: 'g',
  }];
  // Add in other measures
  for (var i = 0; i < foodDetails.foodPortions.length; i++) {
    var foodPortion = foodDetails.foodPortions[i];
    // The gram weight is for `amount` of `unitName` so for
    // a single unit of `unitName` we divide by `amount`.
    servingEquivalentQuantities.push({
      amount: 100.0 * foodPortion.amount / foodPortion.gramWeight,
      unit: foodPortion.modifier,
    });
  }
  return servingEquivalentQuantities;
}

function brandedServingEquivalentQuantities(foodDetails: FoodDetails) : Quantity[] {
  var servingEquivalentQuantities: Quantity[] = [{
    amount: 100.0,
    unit: foodDetails.servingSizeUnit,
  }];
  var match = foodDetails.householdServingFullText.match(/\s*(\d+\.?\d*)\s*(.*)/);
  if (match == null) {
    servingEquivalentQuantities.push({
      amount: 100.0 / foodDetails.servingSize,
      unit: foodDetails.householdServingFullText,
    });
  } else {
    // Assume that if the household serving starts with number, it has the
    // form "2 scoops" and so put the "2" into the quantity. 
    servingEquivalentQuantities.push({
      amount: Number(match[1]) * 100.0 / foodDetails.servingSize,
      unit: match[2],
    });
  }
  return servingEquivalentQuantities;
}
