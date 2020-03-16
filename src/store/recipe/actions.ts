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
import { RecipeAction, RecipeState, RecipeActionType } from "./types";
import { IngredientDatabaseImpl } from "../../IngredientDatabaseImpl";
import { normalizeFood } from "../../../core/normalizeFood";

export function updateDescription(description: string): RecipeAction {
  return {type: RecipeActionType.UPDATE_DESCRIPTION, description};
}

export function loadIngredient(foodId: string) {
  return async (dispatch: Dispatch<RecipeAction>) => {
    const food = await new IngredientDatabaseImpl().getFood(foodId);
    const normalizedFood = food ? await normalizeFood(food, new IngredientDatabaseImpl()) : null;
    if (normalizedFood != null) {
      dispatch({type: RecipeActionType.SET_FOOD_FOR_ID, food: normalizedFood, foodId});
    }
  }
}

export function addIngredient(foodRef: FoodRef) {
  return (dispatch: Dispatch<RecipeAction>) => {
    dispatch({type: RecipeActionType.ADD_INGREDIENT, foodRef});
    return loadIngredient(foodRef.foodId)(dispatch);
  }
}

export function updateIngredientAmount(index: number, amount: number): RecipeAction {
  return {type: RecipeActionType.UPDATE_INGREDIENT_AMOUNT, index, amount};
}

export function updateIngredientUnit(index: number, unit: string): RecipeAction {
  return {type: RecipeActionType.UPDATE_INGREDIENT_UNIT, index, unit};
}

export function updateIngredientId(index: number, selection: {label: string, value: string}[]) {
  return async (dispatch: Dispatch<RecipeAction>) => {
    if (selection.length == 0) {
      dispatch({type: RecipeActionType.DESELECT_INGREDIENT, index});
      return;
    }
    let foodId = selection[0].value;
    dispatch({type: RecipeActionType.UPDATE_INGREDIENT_ID, index, foodId});
    return loadIngredient(foodId)(dispatch);
  }
}
