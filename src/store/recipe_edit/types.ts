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
import { QueryResult } from "../../database";
import { NormalizedFood } from "../../core";

export interface Ingredient {
  amount: number;
  unit: string;
  foodId: string;
  deselected: boolean;
  description: string | null;
  normalizedFood: NormalizedFood | null;
}

export interface State {
  stateType: "RecipeEdit";
  description: string;
  ingredients: (Ingredient | null)[];
}

export enum ActionType {
  UPDATE_DESCRIPTION = "@branded_food/UpdateDescription",
  ADD_INGREDIENT = "@recipe/AddIngredient",
  DELETE_INGREDIENT = "@recipe/DeleteIngredient",
  SELECT_INGREDIENT = "@recipe/SelectIngredient",
  DESELECT_INGREDIENT = "@recipe/DeselectIngredient",
  UPDATE_INGREDIENT_AMOUNT = "@recipe/UpdateIngredientAmount",
  UPDATE_INGREDIENT_UNIT = "@recipe/UpdateIngredientUnit",
  UPDATE_INGREDIENT_FOOD = "@recipe/UpdateIngredientFood",
}

export interface UpdateDescription {
  type: ActionType.UPDATE_DESCRIPTION;
  description: string;
}

export interface AddIngredient {
  type: ActionType.ADD_INGREDIENT;
}

export interface DeleteIngredient {
  type: ActionType.DELETE_INGREDIENT;
  index: number;
}

export interface SelectIngredient {
  type: ActionType.SELECT_INGREDIENT;
  index: number;
  queryResult: QueryResult;
  food: NormalizedFood;
}

export interface DeselectIngredient {
  type: ActionType.DESELECT_INGREDIENT;
  index: number;
}

export interface UpdateIngredientAmount {
  type: ActionType.UPDATE_INGREDIENT_AMOUNT;
  index: number;
  amount: number;
}

export interface UpdateIngredientUnit {
  type: ActionType.UPDATE_INGREDIENT_UNIT;
  index: number;
  unit: string;
}

export interface UpdateIngredientFood {
  type: ActionType.UPDATE_INGREDIENT_FOOD;
  index: number;
  description: string;
  food: NormalizedFood;
}

export type Action =
  | UpdateDescription
  | AddIngredient
  | DeleteIngredient
  | SelectIngredient
  | DeselectIngredient
  | UpdateIngredientAmount
  | UpdateIngredientUnit
  | UpdateIngredientFood;
