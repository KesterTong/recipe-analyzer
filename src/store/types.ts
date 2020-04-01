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
  State as BrandedFoodEditState,
  Action as BrandedFoodEditAction,
} from "./branded_food_edit/types";
import {
  State as RecipeEditState,
  Action as RecipeEditAction,
} from "./recipe_edit/types";
import {
  State as FoodViewState,
  Action as FoodViewAction,
} from "./food_view/types";
import { Food } from "../core";
import { ThunkAction, ThunkDispatch as ReduxThunkDispatch } from "redux-thunk";
import { QueryResult } from "../database";

// State of a food whose description may be known but nothing else.
export interface LoadingState {
  stateType: "Loading";
  food: {
    description: string | null;
  };
}

export interface NutrientInfo {
  id: number;
  name: string;
  display: boolean;
}

// Constraints on RootState
//
//  - If foodState is non-null then foodId should be non-null.
export interface RootState {
  foodId: string | null;
  deselected: boolean;
  foodState:
    | FoodViewState
    | RecipeEditState
    | BrandedFoodEditState
    | LoadingState
    | null;
  config: {
    nutrientInfos: NutrientInfo[];
  };
}

export const initialState: RootState = {
  foodId: null,
  deselected: false,
  foodState: null,
  config: {
    nutrientInfos: [],
  },
};

export enum ActionType {
  SET_NUTRIENT_INFOS = "@SetNutrientInfos",
  DESELECT = "@Deselect",
  SELECT_FOOD = "@SelectFood",
  NEW_FOOD = "@NewFood",
  UPDATE_FOOD = "@UpdateFood",
  UPDATE_AFTER_SAVE = "@UpdateAfterSave",
  UPDATE_FOOD_VIEW_STATE = "@UpdateFoodViewState",
  UPDATE_BRANDED_FOOD_EDIT_STATE = "@UpdateBrandedFoodEditState",
  UPDATE_RECIPE_EDIT_STATE = "@UpdateRecipeEditState",
}

export interface SetNutrientInfos {
  type: ActionType.SET_NUTRIENT_INFOS;
  nutrientInfos: NutrientInfo[];
}

export interface Deselect {
  type: ActionType.DESELECT;
}

export interface SelectFood {
  type: ActionType.SELECT_FOOD;
  QueryResult: QueryResult;
}

export interface NewFood {
  type: ActionType.NEW_FOOD;
  foodId: string;
  food: Food;
}

// Update the data for the current food.
export interface UpdateFood {
  type: ActionType.UPDATE_FOOD;
  food: Food;
}

export interface UpdateFoodViewState {
  type: ActionType.UPDATE_FOOD_VIEW_STATE;
  action: FoodViewAction;
}

export interface UpdateBrandedFoodEditState {
  type: ActionType.UPDATE_BRANDED_FOOD_EDIT_STATE;
  action: BrandedFoodEditAction;
}

export interface UpdateRecipeEditState {
  type: ActionType.UPDATE_RECIPE_EDIT_STATE;
  action: RecipeEditAction;
}

export type RootAction =
  | SetNutrientInfos
  | Deselect
  | SelectFood
  | NewFood
  | UpdateFood
  | UpdateFoodViewState
  | UpdateBrandedFoodEditState
  | UpdateRecipeEditState;

export type ThunkResult<R> = ThunkAction<R, RootState, undefined, RootAction>;
export type ThunkDispatch = ReduxThunkDispatch<
  RootState,
  undefined,
  RootAction
>;
