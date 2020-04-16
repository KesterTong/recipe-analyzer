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
import { ThunkAction, ThunkDispatch as ReduxThunkDispatch } from "redux-thunk";
import { Food } from "../core";
import * as branded_food_edit from "./branded_food_edit/types";
import * as food_input from "./food_input/types";
import * as food_view from "./food_view/types";
import * as recipe_edit from "./recipe_edit/types";

// State of a food whose description may be known but nothing else.
export interface LoadingState {
  stateType: "Loading";
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
  foodInput: food_input.State;
  foodState:
    | branded_food_edit.State
    | food_view.State
    | recipe_edit.State
    | LoadingState
    | null;
  config: {
    nutrientInfos: NutrientInfo[];
  };
}

export const initialState: RootState = {
  foodInput: {
    foodId: null,
    deselected: false,
    description: null,
  },
  foodState: null,
  config: {
    nutrientInfos: [],
  },
};

export enum ActionType {
  SET_NUTRIENT_INFOS = "@SetNutrientInfos",
  SELECT_FOOD = "@SelectFood",
  DESELECT_FOOD = "@DeselectFood",
  NEW_FOOD = "@NewFood",
  UPDATE_FOOD = "@UpdateFood",
  UPDATE_AFTER_SAVE = "@UpdateAfterSave",
}

export interface SetNutrientInfos {
  type: ActionType.SET_NUTRIENT_INFOS;
  nutrientInfos: NutrientInfo[];
}

export interface SelectFood {
  type: ActionType.SELECT_FOOD;
  foodId: string;
  description: string;
}

export interface DeselectFood {
  type: ActionType.DESELECT_FOOD;
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

export type RootAction =
  | SetNutrientInfos
  | SelectFood
  | DeselectFood
  | NewFood
  | UpdateFood
  | food_view.Action
  | branded_food_edit.Action
  | recipe_edit.Action;

export type ThunkResult<R> = ThunkAction<R, RootState, undefined, RootAction>;
export type ThunkDispatch = ReduxThunkDispatch<
  RootState,
  undefined,
  RootAction
>;
