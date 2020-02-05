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

import { Quantity, canonicalizeQuantity } from './Quantity';
import { Nutrients } from "./Nutrients";
import { FoodData } from "./FoodData";
import { FoodDetails } from './FoodDetails';
import { parseQuantity } from './parseQuantity';

export function foodDetailsToFoodData(foodDetails: FoodDetails, nutrientsToDisplay: number[]): FoodData {
  let nutrientsPerServing = nutrientsFromFoodDetails(foodDetails, nutrientsToDisplay);
  if (nutrientsPerServing == null) {
    return null;
  }

  let servingEquivalentQuantitiesDict: {[index: string]: number} = {};
  servingEquivalentQuantitiesFromFoodDetails(foodDetails).forEach(quantity => {
    quantity = canonicalizeQuantity(quantity);
    servingEquivalentQuantitiesDict[quantity.unit] = quantity.amount;
  });
  return {
    description: foodDetails.description,
    nutrientsPerServing: nutrientsPerServing,
    servingEquivalentQuantities: servingEquivalentQuantitiesDict,
  };
}

function nutrientsFromFoodDetails(foodDetails: FoodDetails, nutrientsToDisplay: number[]): Nutrients {
  let result: Nutrients = {};
  for (var i = 0; i < foodDetails.foodNutrients.length; i++) {
    var foodNutrient = foodDetails.foodNutrients[i];
    var nutrientId = foodNutrient.nutrient.id;
    var nutrientAmount = foodNutrient.amount || 0;
    // Only include nutrients that will be displayed, in order to reduce 
    // the computational cost of adding up and scaling nutrients.
    if (nutrientsToDisplay.indexOf(nutrientId) != -1) {
      result[nutrientId] = nutrientAmount
    }
  }
  return result;
}

function servingEquivalentQuantitiesFromFoodDetails(foodDetails: FoodDetails): Quantity[] {
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
  let result: Quantity[] = [{
    amount: 100.0,
    unit: foodDetails.servingSizeUnit,
  }];
  let householdServingQuantity = foodDetails.householdServingFullText == null ? null : parseQuantity(foodDetails.householdServingFullText);
  if (householdServingQuantity != null) {
    result.push({
      amount: 100.0 * householdServingQuantity.amount / foodDetails.servingSize,
      unit: householdServingQuantity.unit,
    });
  }
  return result;
}
