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
import { NutrientInfo } from "../../core/Nutrients";
import { RootState, LoadingFood } from "./RootState";
import { Action as BrandedFoodAction } from "./branded_food/types";
import { Action as RecipeAction } from "./recipe/types";
import { recipeFromState, NEW_RECIPE } from './recipe/conversion';
import { loadIngredient } from "./recipe/actions";
import { brandedFoodFromState, NEW_BRANDED_FOOD } from "./branded_food/conversion";
import { ThunkAction } from "redux-thunk";

export interface SetNutrientInfos {
  type: 'SetNutrientInfos',
  nutrientInfos: NutrientInfo[],
}

export interface Deselect {
  type: 'Deselect';
}

export interface SelectFood {
  type: 'SelectFood',
  foodId: string,
  food: Food | LoadingFood | null,
}

// Update the data for the current food.
export interface UpdateFood {
  type: 'UpdateFood',
  foodId: string,
  food: Food,
}

export type Action = SetNutrientInfos | Deselect | SelectFood | UpdateFood | BrandedFoodAction | RecipeAction;

type ThunkResult<R> = ThunkAction<R, RootState, undefined, Action>;

export function saveFood(): ThunkResult<Promise<void>> {
  return async (_, getState) => {
    let state = getState();
    let food: Food;
    if (state.food == null) {
      return;
    }
    switch (state.food.dataType) {
      case 'Branded Edit':
        food = brandedFoodFromState(state.food);
        break;
      case 'Recipe Edit':
        food = recipeFromState(state.food);
        break;
      default:
        return;
    }
    patchFood(state.selectedFoodId!, food);
  }
}

export function selectFood(selection: {label: string, value: string}[]): ThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    if (selection.length == 0) {
      dispatch({type: 'Deselect'});
      return;
    }
    const foodId = selection[0].value;
    dispatch({
      type: 'SelectFood',
      foodId,
      food: {dataType: 'Loading', description: selection[0].label},
    });
    const food = await getFood(foodId);
    if (food == null) {
      // TODO: handle this error.
      return;
    }
    dispatch({type: 'UpdateFood', foodId, food});
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
    dispatch({type: 'SelectFood', foodId, food});
  }
}

export function newBrandedFood(): ThunkResult<Promise<void>> {
  return dispatch => dispatch(newFood(NEW_BRANDED_FOOD));
}

export function newRecipe(): ThunkResult<Promise<void>> {
  return dispatch => dispatch(newFood(NEW_RECIPE));
}
