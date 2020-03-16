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

import { Action } from "./actions";
import { createStore, applyMiddleware } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";
import { RootState } from "./RootState";
import { brandedFoodReducer } from "./branded_food/reducer";
import { BrandedFoodState, BrandedFoodActionType } from "./branded_food/types";
import { recipeReducer } from "./recipe/reducer";
import { stateFromBrandedFood } from "./branded_food/conversion";
import { RecipeActionType } from "./recipe/types";
import { stateFromRecipe } from './recipe/conversion';

export { RootState, BrandedFoodState }

export function rootReducer(state: RootState | undefined, action: Action): RootState {
  if (state == undefined) {
    return {
      selectedFoodId: null,
      deselected: false,
      food: null,
      nutrientInfos: null,
    };
  }
  switch (action.type) {
    case 'Deselect':
      return {
        ...state,
        deselected: true,
      };
    case 'SelectFood':
      return {
        ...state,
        selectedFoodId: action.foodId,

      }
    case 'SetNutrientInfos':
      return {...state, nutrientInfos: action.nutrientInfos};
    case 'SetFood':
      switch (action.food.dataType) {
        case 'Branded':
          return {
            ...state,
            food: stateFromBrandedFood(action.food),
          }
        case 'Recipe':
          return {
            ...state,
            food: stateFromRecipe(action.food),
          }
        case 'SR Legacy':
          return {...state, food: action.food};
      }
    case RecipeActionType.UPDATE_DESCRIPTION:
    case RecipeActionType.SET_FOOD_FOR_ID:
    case RecipeActionType.ADD_INGREDIENT:
    case RecipeActionType.UPDATE_INGREDIENT_AMOUNT:
    case RecipeActionType.UPDATE_INGREDIENT_UNIT:
    case RecipeActionType.UPDATE_INGREDIENT_ID:
    case RecipeActionType.DESELECT_INGREDIENT:
      if (state.food?.dataType == 'Recipe Edit') {
        return {...state, food: recipeReducer(state.food, action)}
      } else {
        return state;
      }
    case BrandedFoodActionType.UPDATE_DESCRIPTION:
    case BrandedFoodActionType.UPDATE_SERVING_SIZE:
    case BrandedFoodActionType.UPDATE_SERVING_SIZE_UNIT:
    case BrandedFoodActionType.UPDATE_HOUSEHOLD_UNIT:
    case BrandedFoodActionType.UPDATE_NUTRIENT_VALUE:
    case BrandedFoodActionType.SET_SELECTED_QUANTITY:
      if (state.food?.dataType == 'Branded Edit') {
        return {...state, food: brandedFoodReducer(state.food, action)}
      } else {
        return state;
      }
  }
}

export const store = createStore<RootState, Action, any, any>(
  rootReducer, applyMiddleware<ThunkDispatch<RootState, any, Action>, RootState>(thunk));