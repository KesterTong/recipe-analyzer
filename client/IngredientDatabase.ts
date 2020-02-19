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

import { NutrientInfo } from "../core/Nutrients";
import { IngredientIdentifier, FoodRef } from "../core/FoodRef";
import { Food } from "../core/Food";

/**
 * Note that unlike the Apps Script version, this interface returns
 * promises from its methods.
 */
export interface IngredientDatabase {
  getNutrientInfo(): Promise<NutrientInfo[]>;
  getFood(ingredientIdentifier: IngredientIdentifier): Promise<Food | null>,
  patchFood(ingredientIdentifier: IngredientIdentifier, food: Food): Promise<void>,
  searchFoods(query: string): Promise<FoodRef[]>,
  addIngredient(ingredientIdentifier: IngredientIdentifier, amount: number, unit: string, description: string): Promise<void>,
}

let globalIngredientDatabase: IngredientDatabase | null  = null;

export function setIngredientDatabase(ingredientDatabase: IngredientDatabase) {
  globalIngredientDatabase = ingredientDatabase;
}

export function getIngredientDatabase(): IngredientDatabase {
  return globalIngredientDatabase!;
}
