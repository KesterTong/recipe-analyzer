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

import { normalizeFood } from '../../core/normalizeFood';
import { TEST_SR_LEGACY_FOOD, TEST_SR_LEGACY_FOOD_NORMALIZED, TEST_BRANDED_FOOD, TEST_BRANDED_FOOD_NORMALIZED, TEST_RECIPE, TEST_RECIPE_NORMALIZED } from '../testData';

import { expect } from 'chai';
import 'mocha';
import { IngredientDatabase } from '../../core/IngredientDatabase';
import { NutrientInfo } from '../../core/Nutrients';
import { FoodRef } from '../../core/FoodRef';
import { Food } from '../../core/Food';

class FakeIngredientDatabase implements IngredientDatabase {
  getNutrientInfo(): Promise<NutrientInfo[]> {
    return Promise.resolve([{name: '', display: true, id: 1008}, {name: '', display: true, id: 1003}]);
  }
  getFood(foodId: string): Promise<Food | null> {
    return Promise.resolve(TEST_BRANDED_FOOD);
  }
  patchFood(foodId: string, food: Food): Promise<void> {
    throw new Error("Method not implemented.");
  }
  searchFoods(query: string): Promise<FoodRef[]> {
    throw new Error("Method not implemented.");
  }
  addIngredient(foodId: string, amount: number, unit: string, description: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

describe('normalizeFood', () => {
  
  it('SR Legacy', () => {
    return normalizeFood(TEST_SR_LEGACY_FOOD, new FakeIngredientDatabase()).then(result => {
      expect(result).to.deep.equal(TEST_SR_LEGACY_FOOD_NORMALIZED);
    });
  });

  it('Branded', () => {
    return normalizeFood(TEST_BRANDED_FOOD, new FakeIngredientDatabase()).then(result => {
      expect(result).to.deep.equal(TEST_BRANDED_FOOD_NORMALIZED);
    });
  });

  it('Recipe', () => {
    return normalizeFood(TEST_RECIPE, new FakeIngredientDatabase()).then(result => {
      expect(result).to.deep.equal(TEST_RECIPE_NORMALIZED);
    });
  });
});
