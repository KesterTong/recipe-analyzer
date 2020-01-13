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

import { FoodData } from '../nutrients';

export const TEST_SR_LEGACY_FOOD = {
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

export const TEST_SR_LEGACY_FOOD_DATA: FoodData = {
  description: 'Bananas',
  nutrientsPerServing: {calories: 123, protein: 10},
  servingEquivalentQuantities: {
    'g': 100.0,
    'ml': 102.86521739130434,
    'fruit without skin and seed': 0.6578947368421053
  },
};

export const TEST_BRANDED_FOOD = {
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
  labelNutrients: {
    'calories': {value: 170},
    'protein': {value: 2},
  },
};

export const TEST_BRANDED_FOOD_DATA: FoodData = {
  description: 'Plantain Chips',
  nutrientsPerServing: {calories: 425, protein: 5},
  servingEquivalentQuantities: {'g': 100.0, 'piece': 15.0},
};

export const TEST_RECIPE_DATA: FoodData = {
  description: 'My Recipe',
  nutrientsPerServing: {calories: 100, protein: 20},
  servingEquivalentQuantities: {'serving': 1.0},
};
