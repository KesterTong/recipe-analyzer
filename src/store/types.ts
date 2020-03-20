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
import { SRLegacyFood } from "../../core/FoodDataCentral";
import { NutrientInfo } from "../../core/Nutrients";
import { State as BrandedFoodState, Action as BrandedFoodAction} from "./branded_food/types";
import { State as RecipeState, Action as RecipeAction } from "./recipe/types";
import { State as SRLegacyFoodState} from './sr_legacy_food/types';
import { Food } from "../../core/Food";
import { ThunkAction, ThunkDispatch as ReduxThunkDispatch } from "redux-thunk";

export interface SelectedFood {
  foodId: string | null,
  description: string | null,
  deselected: boolean,
}

export interface RootState {
  selectedFood: SelectedFood,
  srLegacyFoodState: SRLegacyFoodState | null,
  recipeState: RecipeState | null,
  brandedFoodState: BrandedFoodState | null,
  nutrientInfos: NutrientInfo[] | null,
}

export const initialState: RootState = {
  selectedFood: {
    foodId: null,
    description: null,
    deselected: false,
  },
  srLegacyFoodState: null,
  recipeState: null,
  brandedFoodState: null,
  nutrientInfos: null,
};


export enum ActionType {
  SET_NUTRIENT_INFOS = '@SetNutrientInfos',
  DESELECT = '@Deselect',
  SELECT_FOOD = '@SelectFood',
  UPDATE_FOOD = '@UpdateFood',
  UPDATE_DESCRIPTION = '@UpdateDescription',
  SET_SELECTED_QUANTITY = '@SetSelectedQuantity',
};

export interface SetNutrientInfos {
  type: ActionType.SET_NUTRIENT_INFOS,
  nutrientInfos: NutrientInfo[],
}

export interface Deselect {
  type: ActionType.DESELECT;
}

export interface LoadingFood {
  dataType: 'Loading',
  description: string,
}

export interface SelectFood {
  type: ActionType.SELECT_FOOD,
  foodId: string,
  food: Food | LoadingFood | null,
}

// Update the data for the current food.
export interface UpdateFood {
  type: ActionType.UPDATE_FOOD,
  food: Food,
}

export interface UpdateDescription {
  type: ActionType.UPDATE_DESCRIPTION,
  description: string,
}

export interface SetSelectedQuantity {
  type: ActionType.SET_SELECTED_QUANTITY,
  index: number,
}

export type RootAction = SetNutrientInfos | Deselect | SelectFood | UpdateFood | UpdateDescription | SetSelectedQuantity | BrandedFoodAction | RecipeAction;

export type ThunkResult<R> = ThunkAction<R, RootState, undefined, RootAction>;
export type ThunkDispatch = ReduxThunkDispatch<RootState, undefined, RootAction>;

