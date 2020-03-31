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

import { RootAction, ActionType, ThunkDispatch, ThunkResult } from "./types";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { RootState, initialState } from "./types";
import { reducer as brandedFoodReducer } from "./branded_food_edit/reducer";
import { State as BrandedFoodState } from "./branded_food_edit/types";
import { reducer as recipeReducer } from "./recipe_edit/reducer";
import { State as SRLegacyFoodState } from "./food_view/types";
import { reducer as foodViewReducer } from "./food_view/reducer";
import { stateFromBrandedFood } from "./branded_food_edit/conversion";
import { State as RecipeState } from "./recipe_edit/types";
import { stateFromRecipe } from "./recipe_edit/conversion";
import { selectFoodRef } from "./selectors";
import { Food } from "../core/Food";

export {
  RootState,
  BrandedFoodState,
  RecipeState,
  ThunkDispatch,
  ThunkResult,
  selectFoodRef,
};

function foodStateFromFood(
  food: Food
): RecipeState | BrandedFoodState | SRLegacyFoodState {
  switch (food.dataType) {
    case "Branded":
      return stateFromBrandedFood(food);
    case "Recipe":
      return stateFromRecipe(food);
    case "SR Legacy":
      return {
        stateType: "FoodView",
        food: food,
        selectedQuantity: 0,
      };
  }
}

function rootReducer(
  state: RootState = initialState,
  action: RootAction
): RootState {
  switch (action.type) {
    case ActionType.DESELECT:
      return { ...state, deselected: true };
    case ActionType.SELECT_FOOD:
      return {
        ...state,
        foodId: action.foodRef.foodId,
        deselected: false,
        foodState: {
          stateType: "Loading",
          food: { description: action.foodRef.description },
        },
      };
    case ActionType.NEW_FOOD:
      return {
        ...state,
        foodId: action.foodId,
        deselected: false,
        foodState: foodStateFromFood(action.food),
      };
    case ActionType.UPDATE_FOOD:
      return {
        ...state,
        foodState: foodStateFromFood(action.food),
      };
    case ActionType.UPDATE_FOOD_VIEW_STATE:
      if (state.foodState?.stateType != "FoodView") {
        return state;
      }
      return {
        ...state,
        foodState: foodViewReducer(state.foodState, action.action),
      };
    case ActionType.UPDATE_BRANDED_FOOD_EDIT_STATE:
      if (state.foodState?.stateType != "BrandedFoodEdit") {
        return state;
      }
      return {
        ...state,
        foodState: brandedFoodReducer(state.foodState, action.action),
      };
    case ActionType.UPDATE_RECIPE_EDIT_STATE:
      if (state.foodState?.stateType != "RecipeEdit") {
        return state;
      }
      return {
        ...state,
        foodState: recipeReducer(state.foodState, action.action),
      };
    case ActionType.SET_NUTRIENT_INFOS:
      return {
        ...state,
        config: { ...state.config, nutrientInfos: action.nutrientInfos },
      };
    default:
      return state;
  }
}

export const store = createStore(
  rootReducer,
  applyMiddleware<ThunkDispatch>(thunk)
);
