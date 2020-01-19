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

/** Tools for computations with nutritional data */

export interface Nutrients {
  [index: string]: number;
};

export interface Quantity {
  amount: number;
  unit: string;
}

export interface FoodData {
  description: string;
  nutrientsPerServing: Nutrients;
  // amount and unit of serving equivalent quantities,
  // represented as a dict.
  servingEquivalentQuantities: {[index: string]: number};
}

export function scaleNutrients(nutrients: Nutrients, scale: number): Nutrients {
  var result: Nutrients = {};
  for (var nutrientKey in nutrients) {
    result[nutrientKey] = nutrients[nutrientKey] * scale;
  }
  return result;
}

export function addNutrients(lhs: Nutrients, rhs: Nutrients): Nutrients {
  var result: Nutrients = {};
  for (var nutrientKey in lhs) {
    result[nutrientKey] = lhs[nutrientKey];
  }
  for (var nutrientKey in rhs) {
    result[nutrientKey] = (result[nutrientKey] || 0) + rhs[nutrientKey];
  }
  return result;
}

export function nutrientsForQuantity(quantity: Quantity, foodData: FoodData): Nutrients {
  quantity = canonicalizeQuantity(quantity);
  // The number of units of the quantity per serving.
  let unitsPerServing = foodData.servingEquivalentQuantities[quantity.unit];
  if (unitsPerServing == null) {
      return null;
  }
  var servings = quantity.amount / unitsPerServing;
  return scaleNutrients(foodData.nutrientsPerServing, servings);
}

export function makeFoodData(
  description:string,
  nutrientsPerServing: Nutrients,
  servingEquivalentQuantities: Quantity[]) {
  let servingEquivalentQuantitiesDict: {[index: string]: number} = {};
  servingEquivalentQuantities.forEach(quantity => {
    quantity = canonicalizeQuantity(quantity);
    servingEquivalentQuantitiesDict[quantity.unit] = quantity.amount;
  });
  return {
    description: description,
    nutrientsPerServing: nutrientsPerServing,
    servingEquivalentQuantities: servingEquivalentQuantitiesDict,
  };
}

/**
 * Transform a quantity by
 *  - Converting mass units to 'g' and volume units to 'ml'.
 *  - Removing trailing 's' to alllow plural and singular forms.
 *  - Convert to lowercase.
 */
function canonicalizeQuantity(quantity: Quantity): Quantity {
  var amount = quantity.amount;
  var unit = quantity.unit.toLowerCase().replace(/(\w*)s$/, '$1');
  const gramEquivalentByUnit: {[index: string]: number} = {
    'oz': 28.35,
    'lb': 453.59,
    'kg': 1000.00,
  };
  const mlEquivalentByUnit: {[index: string]: number} = {
    'fl oz': 29.5735,
    'fl. oz': 29.5735,
    'cup': 236.59,
    'tbsp': 14.79,
    'tablespoon': 14.79,
    'tsp': 4.93,
    'teaspoon': 4.93,
    'pint': 473.17,
    'quart': 946.35,
    'gallon': 3785.41,
  };
 
  if (gramEquivalentByUnit[unit]) {
    return {
      amount: amount * gramEquivalentByUnit[unit],
      unit: 'g',
    };
  }
  if (mlEquivalentByUnit[unit]) {
    return {
      amount: amount * mlEquivalentByUnit[unit],
      unit: 'ml',
    };
  }
  return {amount: amount, unit: unit};
}
