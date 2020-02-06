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

import { FoodData } from '../core/FoodData';
import { FDCFood, CustomFood } from '../core/FoodDetails';

export const TEST_SR_LEGACY_FOOD: FDCFood = {
  description: 'Bananas',
  dataType: 'SR Legacy',
  fdcId: 12345,
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
  foodIdentifier: {foodType: 'FDC Food', fdcId: 12345},
  brandOwner: '',
  ingredients: '',
  description: 'Bananas',
  nutrientsPerServing: {1008: 123, 1003: 10},
  servingEquivalentQuantities: {
    'g': 100.0,
    'ml': 102.86521739130434,
    'fruit without skin and seed': 0.6578947368421053
  },
};

export const TEST_BRANDED_FOOD: FDCFood = {
  description: 'Plantain Chips',
  fdcId: 23456,
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

export const TEST_BRANDED_FOOD_DATA: FoodData = {
  foodIdentifier: {foodType: 'FDC Food', fdcId: 23456},
  brandOwner: '',
  ingredients: '',
  description: 'Plantain Chips',
  nutrientsPerServing: {1008: 425, 1003: 5},
  servingEquivalentQuantities: {'g': 100.0, 'piece': 15.0},
};

export const TEST_RECIPE_DETAILS: CustomFood = {
  dataType: 'Custom',
  bookmarkId: 'id.abc123',
  description: 'My Recipe',
  foodNutrients: [{
    nutrient: {id: 1008},
    amount: 100.0
  }, {
    nutrient: {id: 1003},
    amount: 20.0
  }],
  servingSize: 100,
  servingSizeUnit: 'g',
  householdServingFullText: '1 serving',
};
