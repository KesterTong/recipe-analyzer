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

import { Quantity, canonicalizeQuantity, nutrientsForQuantity } from './Quantity';
import { Nutrients, scaleNutrients, addNutrients } from "./Nutrients";
import { FDCFood, SRLegacyFood, HouseholdServing } from './FoodDataCentral';
import { parseQuantity } from './parseQuantity';
import { Food } from './Food';
import { NormalizedFood } from './NormalizedFood';
import { IngredientDatabase } from './IngredientDatabase';
import { Recipe } from './Recipe';

export function normalizeFood(food: Food, ingredientDatabase: IngredientDatabase): Promise<NormalizedFood> {
  return ingredientDatabase.getNutrientInfo().then(nutrientInfo => {
    switch (food.dataType) {
      case 'SR Legacy':
      case 'Branded':
        return nutrientsFromFoodDetails(food, nutrientInfo.map(info => info.id));
      case 'Recipe':
        return nutrientsForRecipe(food, ingredientDatabase);
    }
  }).then(nutrientsPerServing => ({
    description: food.description,
    nutrientsPerServing: nutrientsPerServing,
    servingEquivalentQuantities: servingEquivalentQuantities(food),
  }));
}

function nutrientsForRecipe(food: Recipe, ingredientDatabase: IngredientDatabase): Promise<Nutrients> {
  return Promise.all(food.ingredientsList.map(ingredient =>
    ingredientDatabase
    .getFood(ingredient.foodId)
    .then(subFood => normalizeFood(subFood!, ingredientDatabase))
    .then(normalizedSubFood => nutrientsForQuantity(ingredient.quantity, normalizedSubFood)!)
  ))
  .then(nutrients => {
    return nutrients.reduce(addNutrients);
  })
}

export function nutrientsFromFoodDetails(foodDetails: FDCFood, nutrientsToDisplay: number[]): Nutrients {
  let nutrientsById: {[id: number]: number} = {};
  for (var i = 0; i < foodDetails.foodNutrients.length; i++) {
    var foodNutrient = foodDetails.foodNutrients[i];
    var nutrientId = foodNutrient.nutrient.id;
    var nutrientAmount = foodNutrient.amount || 0;
    // Only include nutrients that will be displayed, in order to reduce 
    // the computational cost of adding up and scaling nutrients.
    if (nutrientsToDisplay.indexOf(nutrientId) != -1) {
      nutrientsById[nutrientId] = nutrientAmount
    }
  }
  return nutrientsToDisplay.map(id => nutrientsById[id] || 0);
}

export function servingEquivalentQuantities(food: Food): {[index: string]: number} {
  let servingEquivalentQuantities: Quantity[];
  switch (food.dataType) {
    case 'SR Legacy':
      servingEquivalentQuantities = SRLegacyServingEquivalentQuantities(food);
      break;
    case 'Branded':
      servingEquivalentQuantities = brandedServingEquivalentQuantities(food);
      break;
    case 'Recipe':
      servingEquivalentQuantities = [{amount: 1, unit: 'serving'}];
      break;
  }
  let result: {[index: string]: number} = {};
  servingEquivalentQuantities.forEach(quantity => {
    quantity = canonicalizeQuantity(quantity);
    result[quantity.unit] = quantity.amount;
  });
  return result;
}

function SRLegacyServingEquivalentQuantities(foodDetails: SRLegacyFood) : Quantity[] {
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

function brandedServingEquivalentQuantities(foodDetails: HouseholdServing) : Quantity[] {
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
