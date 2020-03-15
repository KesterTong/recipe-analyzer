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
import { RecipeAction, RecipeState } from "./types";
import { IngredientDatabaseImpl } from "../../IngredientDatabaseImpl";
import { normalizeFood } from "../../../core/normalizeFood";

export function updateDescription(description: string): RecipeAction {
  return {type: 'UpdateDescription', description};
}

export function loadIngredient(foodId: string) {
  return async (dispatch: Dispatch<RecipeAction>, getState: () => RecipeState) => {
    const food = await new IngredientDatabaseImpl().getFood(foodId);
    const normalizedFood = food ? await normalizeFood(food, new IngredientDatabaseImpl()) : null;
    if (normalizedFood != null) {
      dispatch({type: 'SetFoodForId', food: normalizedFood, foodId});
    }
  }
}

export function addIngredient(foodRef: FoodRef) {
  return (dispatch: Dispatch<RecipeAction>, getState:() => RecipeState) => {
    dispatch({type: 'AddIngredient', foodRef});
    return loadIngredient(foodRef.foodId)(dispatch, getState);
  }
}

export function updateIngredientAmount(index: number, amount: number): RecipeAction {
  return {type: 'UpdateIngredientAmount', index, amount};
}

export function updateIngredientUnit(index: number, unit: string): RecipeAction {
  return {type: 'UpdateIngredientUnit', index, unit};
}

export function updateIngredientId(index: number, foodRef: FoodRef) {
  return async (dispatch: Dispatch<RecipeAction>, getState:() => RecipeState) => {
    dispatch({type: 'UpdateIngredientId', index, foodRef});
    return loadIngredient(foodRef.foodId)(dispatch, getState);
  }
}