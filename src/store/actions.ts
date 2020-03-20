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
import { patchFood, getFood, insertFood } from "../IngredientDatabaseImpl";
import { Food } from "../../core/Food";
import { Action, ThunkResult, ActionType } from "./types";
import { recipeFromState, NEW_RECIPE } from './recipe/conversion';
import { loadIngredient } from "./recipe/actions";
import { brandedFoodFromState, NEW_BRANDED_FOOD } from "./branded_food/conversion";

export function updateDescription(description: string): Action {
  return {type: ActionType.UPDATE_DESCRIPTION, description};
}

export function saveFood(): ThunkResult<Promise<void>> {
  return async (_, getState) => {
    let state = getState();
    let foodId = state.selectedFood.foodId;
    if (foodId == null) {
      return;
    }
    if (state.brandedFoodState) {
      return patchFood(foodId, brandedFoodFromState(state.brandedFoodState));
    } else if (state.recipeState) {
      return patchFood(foodId, recipeFromState(state.recipeState));
    }
  }
}

export function selectFood(selection: {label: string, value: string}[]): ThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    if (selection.length == 0) {
      dispatch({type: ActionType.DESELECT});
      return;
    }
    const foodId = selection[0].value;
    dispatch({
      type: ActionType.SELECT_FOOD,
      foodId,
      food: {dataType: 'Loading', description: selection[0].label},
    });
    const food = await getFood(foodId);
    if (food == null) {
      // TODO: handle this error.
      return;
    }
    if (getState().selectedFood.foodId != foodId) {
      return;
    }
    dispatch({type: ActionType.UPDATE_FOOD, foodId, food});
    if (food.dataType == 'Recipe') {
      food.ingredientsList.forEach(ingredient => {
        dispatch(loadIngredient(ingredient.foodId));
      });
    }
  } 
}

function newFood(food: Food): ThunkResult<Promise<void>> {
  return async dispatch => {
    let foodId = await insertFood(food);
    dispatch({type: ActionType.SELECT_FOOD, foodId, food});
  }
}

export function newBrandedFood(): ThunkResult<Promise<void>> {
  return dispatch => dispatch(newFood(NEW_BRANDED_FOOD));
}

export function newRecipe(): ThunkResult<Promise<void>> {
  return dispatch => dispatch(newFood(NEW_RECIPE));
}
