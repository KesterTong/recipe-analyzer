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
  Update,
  Recipe,
  StatusOr,
  NormalizedFood,
  ConversionData,
} from "../core";
import { Config } from "./config";

export enum ActionType {
  INITIALIZE = "@Initialize",
  INITIALIZATION_ERROR = "@InitializationError",
  UPDATE_RECIPES = "@UpdateRecipes",
  UPDATE_FDC_FOODS = "@UpdateFdcFoods",
  SELECT_RECIPE = "@SelectRecipe",
  SELECT_INGREDIENT = "@SelectIngredient",
}

export interface Initialize {
  type: ActionType.INITIALIZE;
  recipes: Recipe[];
  fdcFoodsById: { [index: number]: StatusOr<NormalizedFood> };
  config: Config;
  conversionData: ConversionData;
}

export interface InitializationError {
  type: ActionType.INITIALIZATION_ERROR;
  message: string;
}

export interface UpdateRecipes {
  type: ActionType.UPDATE_RECIPES;
  update: Update;
}

export interface UpdateFdcFoods {
  type: ActionType.UPDATE_FDC_FOODS;
  fdcFoodsById: { [index: number]: StatusOr<NormalizedFood> };
}

export interface SelectRecipe {
  type: ActionType.SELECT_RECIPE;
  index: number;
}

export interface SelectIngredient {
  type: ActionType.SELECT_INGREDIENT;
  index: number;
}

export type RootAction =
  | Initialize
  | InitializationError
  | UpdateRecipes
  | UpdateFdcFoods
  | SelectRecipe
  | SelectIngredient;
