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

import { Action, ActionType } from "./actions";
import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";
import { RootState, initialState } from "./RootState";
import { brandedFoodReducer } from "./branded_food/reducer";
import { State as BrandedFoodState, ActionType as BrandedFoodActionType } from "./branded_food/types";
import { recipeReducer } from "./recipe/reducer";
import { stateFromBrandedFood } from "./branded_food/conversion";
import { State as RecipeState, ActionType as RecipeActionType } from "./recipe/types";
import { stateFromRecipe } from './recipe/conversion';
import { SRLegacyFood } from "../../core/FoodDataCentral";
import { Food } from "../../core/Food";

export { RootState, BrandedFoodState, RecipeState }

function stateFromFood(food: Food): SRLegacyFood | BrandedFoodState | RecipeState {
  switch (food.dataType) {
    case 'Branded':
      return stateFromBrandedFood(food);
    case 'Recipe':
      return stateFromRecipe(food);
    case 'SR Legacy':
      return food;
  }
}

const rootReducer = combineReducers<RootState, Action>({
  selectedFood: (state = initialState.selectedFood, action) => {
    switch(action.type) {
      case ActionType.DESELECT:
        return {...state, deselected: true};
      case ActionType.SELECT_FOOD:
        return {
          foodId: action.foodId,
          description: action.food ? action.food.description : null,
          deselected: false,
        }
      case ActionType.UPDATE_FOOD:
        return {
          ...state,
          description: action.food.description,
        }
      default:
        return state;
    }
  },
  nutrientInfos: (state = initialState.nutrientInfos, action) => {
    switch (action.type) {
      case ActionType.SET_NUTRIENT_INFOS:
        return action.nutrientInfos;
      default:
        return state;
    }
  },
  srLegacyFood: (state = initialState.srLegacyFood, action) => {
    switch(action.type) {
      case ActionType.SELECT_FOOD:
      case ActionType.UPDATE_FOOD:
        return action.food?.dataType == 'SR Legacy' ? action.food : null;
      default:
        return state;
    }
  },
  brandedFoodState: brandedFoodReducer,
  recipeState: recipeReducer,
})

export const store = createStore(
  rootReducer,
  applyMiddleware<ThunkDispatch<RootState, undefined, Action>>(thunk));