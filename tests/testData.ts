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

import { NormalizedFood } from '../core/NormalizedFood';
import { Food } from '../core/Food';
import { BrandedFood } from '../core/FoodDataCentral';

export const TEST_SR_LEGACY_FOOD: Food = {
  description: 'Bananas',
  dataType: 'SR Legacy',
  foodNutrients: [{
    nutrient: {id: 1008},
    amount: 123.0
  }, {
    nutrient: {id: 1003},
    amount: 10.0
  }],
  foodPortions: [{
    modifier: 'cup',
    gramWeight: 230.0,
    amount:1.0,
  }, {
    modifier: 'fruit without skin and seeds',
    gramWeight: 304.0,
    amount: 2.0,
  }]
};

export const TEST_SR_LEGACY_FOOD_NORMALIZED: NormalizedFood = {
  description: 'Bananas',
  nutrientsPerServing: [123, 10],
  servingEquivalentQuantities: {
    'g': 100.0,
    'ml': 102.86521739130434,
    'fruit without skin and seed': 0.6578947368421053
  },
};

export const TEST_BRANDED_FOOD: BrandedFood = {
  description: 'Plantain Chips',
  dataType: 'Branded',
  foodNutrients: [{
    nutrient: {id: 1008},
    amount: 425.0
  }, {
    nutrient: {id: 1003},
    amount: 5.0
  }],
  servingSize: 40,
  servingSizeUnit: 'g',
  householdServingFullText: '6 pieces',
};

export const TEST_BRANDED_FOOD_NORMALIZED: NormalizedFood = {
  description: 'Plantain Chips',
  nutrientsPerServing: [425, 5],
  servingEquivalentQuantities: {'g': 100.0, 'piece': 15.0},
};

export const TEST_RECIPE: Food = {
  dataType: 'Recipe',
  description: 'My Recipe',
  ingredientsList: [{
    quantity: {
      amount: 7.5,
      unit: 'piece'
    },
    foodId: 'userData/id.abc123',
  }],
};

export const TEST_RECIPE_NORMALIZED: NormalizedFood = {
  description: 'My Recipe',
  nutrientsPerServing: [212.5, 2.5],
  servingEquivalentQuantities: {'serving': 1.0},
};
