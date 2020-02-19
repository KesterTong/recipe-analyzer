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

import { Food } from './Food';
import { FoodRef, IngredientIdentifier } from './FoodRef';
import { NutrientInfo } from './Nutrients';

/**
 * Class to store and lookup ingredients.
 * 
 * Looks up USDA Food Data Central database and stores and looks up local ingredients.
 */
export interface IngredientDatabase {
  getNutrientInfo(): NutrientInfo[];
  getFood(ingredientIdentifier: IngredientIdentifier): Food | null;
  patchFood(ingredientIdentifier: IngredientIdentifier, food: Food): void;
  searchFoods(query: string): FoodRef[];
}