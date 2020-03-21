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
import { FoodRef } from "../../../core/FoodRef";
import { NormalizedFood } from "../../../core/NormalizedFood";
import { Quantity } from "../../../core/Quantity";
import { State as FoodInputState } from '../food_input/types';

export interface State {
  description: string,
  ingredients: {
    quantity: Quantity,
    foodInputState: FoodInputState,
    normalizedFood: NormalizedFood | null,
  }[];
}

export enum ActionType {
  UPDATE_DESCRIPTION = '@recipe/UpdateDescription',
  ADD_INGREDIENT = '@recipe/AddIngredient',
  DELETE_INGREDIENT = '@recipe/DeleteIngredient',
  UPDATE_INGREDIENT_AMOUNT = '@recipe/UpdateIngredientAmount',
  UPDATE_INGREDIENT_UNIT = '@recipe/UpdateIngredientUnit',
  UPDATE_INGREDIENT = '@recipe/UpdateIngredient',
  UPDATE_INGREDIENT_FOOD = '@recipe/UpdateIngredientFood',
  DESELECT_INGREDIENT = '@recipe/DeselectIngredient',
}

export interface AddIngredient {
  type: ActionType.ADD_INGREDIENT,
}

export interface DeleteIngredient {
  type: ActionType.DELETE_INGREDIENT,
  index: number,
}

export interface UpdateIngredientAmount {
  type: ActionType.UPDATE_INGREDIENT_AMOUNT,
  index: number,
  amount: number,
}

export interface UpdateIngredientUnit {
  type: ActionType.UPDATE_INGREDIENT_UNIT,
  index: number,
  unit: string,
}

export interface UpdateIngredient {
  type: ActionType.UPDATE_INGREDIENT,
  index: number,
  foodRef: FoodRef,
  food: NormalizedFood,
}

export interface UpdateIngredientFood {
  type: ActionType.UPDATE_INGREDIENT_FOOD,
  index: number,
  food: NormalizedFood,
}

export interface DeselectIngredient {
  type: ActionType.DESELECT_INGREDIENT,
  index: number,
}

export type Action = AddIngredient | DeleteIngredient | UpdateIngredientAmount | UpdateIngredientUnit | UpdateIngredient | UpdateIngredientFood | DeselectIngredient;