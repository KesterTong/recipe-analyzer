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
import { Recipe, Ingredient } from "../src/document/Document";

export enum UpdateType {
  ADD_INGREDIENT = "@AddIngredient",
  UPDATE_INGREDIENT = "@UpdateIngredient",
  DELETE_INGREDIENT = "@DeleteIngredient",
}

export interface AddIngredient {
  type: UpdateType.ADD_INGREDIENT;
  recipeIndex: number;
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

export type Update = AddIngredient | UpdateIngredient | DeleteIngredient;

/**
 * A database of recipes.
 *
 * The only non-testing implementation of this class stores recipes
 * in a Google Doc.  See /apps_script/sidebar.tsx.
 */
export interface Database {
  parseDocument(): Promise<Recipe[]>;
  updateDocument(update: Update): Promise<void>;
}
