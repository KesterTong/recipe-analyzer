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
import { Recipe } from "../../../core/Recipe";
import { FoodRef } from "../../../core/FoodRef";
import { NormalizedFood } from "../../../core/NormalizedFood";

export type RecipeState = {
  dataType: 'Recipe Edit';
  recipe: Recipe;
  foodsById: {[index: string]: NormalizedFood};
}

export interface UpdateDescription {
  type: 'UpdateRecipeDescription',
  description: string,
}

export interface SetFoodForId {
  type: 'SetFoodForId',
  food: NormalizedFood,
  foodId: string,
}

export interface AddIngredient {
  type: 'AddIngredient',
  foodRef: FoodRef,
}

export interface UpdateIngredientAmount {
  type: 'UpdateIngredientAmount',
  index: number,
  amount: number,
}

export interface UpdateIngredientUnit {
  type: 'UpdateIngredientUnit',
  index: number,
  unit: string,
}

export interface UpdateIngredientId {
  type: 'UpdateIngredientId',
  index: number,
  foodRef: FoodRef,
}

export type RecipeAction = UpdateDescription | SetFoodForId | AddIngredient | UpdateIngredientAmount | UpdateIngredientUnit | UpdateIngredientId;