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

import { NutrientInfo } from "./Nutrients";
import { FoodRef } from "./FoodRef";
import { Food } from "./Food";

/**
 * Note that unlike the Apps Script version, this interface returns
 * promises from its methods.
 */
export interface IngredientDatabase {
  getNutrientInfo(): Promise<NutrientInfo[]>;
  getFood(foodId: string): Promise<Food | null>,
  patchFood(foodId: string, food: Food): Promise<void>,
  searchFoods(query: string): Promise<FoodRef[]>,
}