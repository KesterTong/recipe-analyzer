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
import { Dispatch } from "react";
import { RecipeAction, RecipeActionType } from "./types";
import { getFood } from "../../IngredientDatabaseImpl";
import { normalizeFood } from "../../../core/normalizeFood";
import { RootState } from "..";
import { ThunkAction } from "redux-thunk";
import { Action } from "../actions";

type ThunkResult<R> = ThunkAction<R, RootState, undefined, Action>;

export function updateDescription(description: string): Action {
  return {type: RecipeActionType.UPDATE_DESCRIPTION, description};
}

export function loadIngredient(foodId: string): ThunkResult<void> {
  return async (dispatch, getState) => {
    const food = await getFood(foodId);
    const normalizedFood = food ? await normalizeFood(food, getFood, getState().nutrientInfos?.map(nutrientInfo => nutrientInfo.id) || []) : null;
    if (normalizedFood != null) {
      dispatch({type: RecipeActionType.SET_FOOD_FOR_ID, food: normalizedFood, foodId});
    }
  }
}

export function addIngredient(foodRef: FoodRef): ThunkResult<void> {
  return dispatch => {
    dispatch({type: RecipeActionType.ADD_INGREDIENT, foodRef});
    dispatch(loadIngredient(foodRef.foodId));
  }
}

export function updateIngredientAmount(index: number, amount: number): RecipeAction {
  return {type: RecipeActionType.UPDATE_INGREDIENT_AMOUNT, index, amount};
}

export function updateIngredientUnit(index: number, unit: string): RecipeAction {
  return {type: RecipeActionType.UPDATE_INGREDIENT_UNIT, index, unit};
}

export function updateIngredientId(index: number, selection: {label: string, value: string}[]): ThunkResult<void> {
  return async dispatch => {
    if (selection.length == 0) {
      dispatch({type: RecipeActionType.DESELECT_INGREDIENT, index});
      return;
    }
    let foodId = selection[0].value;
    dispatch({type: RecipeActionType.UPDATE_INGREDIENT_ID, index, foodId});
    return dispatch(loadIngredient(foodId));
  }
}
