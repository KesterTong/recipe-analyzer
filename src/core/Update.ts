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
import { Recipe, Ingredient } from "./Recipe";

export enum UpdateType {
  INSERT_INGREDIENT = "@InsertIngredient",
  UPDATE_INGREDIENT = "@UpdateIngredient",
  DELETE_INGREDIENT = "@DeleteIngredient",
  MOVE_INGREDIENT = "@MoveIngredient",
}

export interface InsertIngredient {
  type: UpdateType.INSERT_INGREDIENT;
  recipeIndex: number;
  atIndex: number;
}

export interface UpdateIngredient {
  type: UpdateType.UPDATE_INGREDIENT;
  recipeIndex: number;
  ingredientIndex: number;
  newAmount?: string;
  newUnit?: string;
  newFood?: { description: string; url: string | null };
}

export interface DeleteIngredient {
  type: UpdateType.DELETE_INGREDIENT;
  recipeIndex: number;
  ingredientIndex: number;
}

export interface MoveIngredient {
  type: UpdateType.MOVE_INGREDIENT;
  recipeIndex: number;
  initialIngredientIndex: number;
  finalIngredientIndex: number;
}

export type Update =
  | InsertIngredient
  | UpdateIngredient
  | DeleteIngredient
  | MoveIngredient;
