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
import { NutrientInfo } from "../../core/Nutrients";
import {
  State as BrandedFoodState,
  Action as BrandedFoodAction,
} from "./branded_food/types";
import { State as RecipeState, Action as RecipeAction } from "./recipe/types";
import { State as SRLegacyFoodState } from "./sr_legacy_food/types";
import { Food } from "../../core/Food";
import { ThunkAction, ThunkDispatch as ReduxThunkDispatch } from "redux-thunk";
import { FoodRef } from "../../core/FoodRef";

// Constraints on RootState
//
//  - Only one  of srLegacyFoodState, recipeState or BrandedFoodState
//    should be non-null.
//
//  - If any of srLegacyFoodState, recipeState or BrandedFoodState is
//    non-null then selectedFood.foodRef should be non-null.
export interface RootState {
  selectedFood: {
    foodRef: FoodRef | null;
    deselected: boolean;
  };
  foodState: SRLegacyFoodState | RecipeState | BrandedFoodState | null;
  nutrientNames: string[];
  nutrientIds: number[];
}

export const initialState: RootState = {
  selectedFood: { foodRef: null, deselected: false },
  foodState: null,
  nutrientNames: [],
  nutrientIds: [],
};

export enum ActionType {
  SET_NUTRIENT_INFOS = "@SetNutrientInfos",
  DESELECT = "@Deselect",
  SELECT_FOOD = "@SelectFood",
  NEW_FOOD = "@NewFood",
  UPDATE_FOOD = "@UpdateFood",
  UPDATE_AFTER_SAVE = "@UpdateAfterSave",
  SET_SELECTED_QUANTITY = "@SetSelectedQuantity",
  UPDATE_BRANDED_FOOD = "@UpdateBrandedFood",
  UPDATE_RECIPE = "@UpdateRecipe",
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
  foodRef: FoodRef;
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

export interface UpdateAfterSave {
  type: ActionType.UPDATE_AFTER_SAVE;
  food: Food;
}

export interface SetSelectedQuantity {
  type: ActionType.SET_SELECTED_QUANTITY;
  index: number;
}

export interface UpdateBrandedFood {
  type: ActionType.UPDATE_BRANDED_FOOD;
  action: BrandedFoodAction;
}

export interface UpdateRecipe {
  type: ActionType.UPDATE_RECIPE;
  action: RecipeAction;
}

export type RootAction =
  | SetNutrientInfos
  | Deselect
  | SelectFood
  | NewFood
  | UpdateFood
  | UpdateAfterSave
  | SetSelectedQuantity
  | UpdateBrandedFood
  | UpdateRecipe;

export type ThunkResult<R> = ThunkAction<R, RootState, undefined, RootAction>;
export type ThunkDispatch = ReduxThunkDispatch<
  RootState,
  undefined,
  RootAction
>;
