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
import {
  State as Ingredient,
  Action as UpdateIngredientAction,
} from "../ingredient";
import { Food } from "../../core";

export interface State {
  stateType: "RecipeEdit";
  description: string;
  ingredients: Ingredient[];
  foodCache: { [index: string]: Food };
}

export enum ActionType {
  UPDATE_DESCRIPTION = "@branded_food/UpdateDescription",
  ADD_INGREDIENT = "@recipe/AddIngredient",
  DELETE_INGREDIENT = "@recipe/DeleteIngredient",
  UPDATE_INGREDIENT = "@recipe/UpdateIngredient",
  UPDATE_FOOD_CACHE = "@recipe/UpdateFoodCache",
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

export interface UpdateIngredient {
  type: ActionType.UPDATE_INGREDIENT;
  index: number;
  action: UpdateIngredientAction;
}

export interface UpdateFoodCache {
  type: ActionType.UPDATE_FOOD_CACHE;
  foodId: string;
  food: Food;
}

export type Action =
  | UpdateDescription
  | AddIngredient
  | DeleteIngredient
  | UpdateIngredient
  | UpdateFoodCache;
