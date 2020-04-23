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

import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { Food, getDisplayQuantities } from "../core";
import * as food_input from "./food_input";
import * as branded_food_edit from "./branded_food_edit";
import * as food_view from "./food_view";
import * as recipe_edit from "./recipe_edit";
import {
  RootState,
  RootAction,
  ActionType,
  ThunkDispatch,
  initialState,
} from "./types";

export * from "./actions";
export * from "./types";

function foodStateFromFood(
  food: Food
): recipe_edit.State | branded_food_edit.State | food_view.State {
  switch (food.dataType) {
    case "Branded":
      return branded_food_edit.stateFromBrandedFood(food);
    case "Recipe":
      return recipe_edit.stateFromRecipe(food);
    case "SR Legacy":
      return {
        stateType: "FoodView",
        food: food,
        selectedQuantity: getDisplayQuantities(food)[0],
      };
  }
}

function rootReducer(
  state: RootState = initialState,
  action: RootAction
): RootState {
  switch (action.type) {
    case ActionType.UPDATE_FOOD_INPUT:
      return {
        ...state,
        foodInput: food_input.reducer(state.foodInput, action.action),
        ...(action.action.type == food_input.ActionType.SELECT
          ? { foodState: { stateType: "Loading" } }
          : {}),
      };
    case ActionType.NEW_FOOD:
      return {
        ...state,
        foodInput: {
          foodId: action.foodId,
          deselected: false,
          description: action.food.description,
        },
        foodState: foodStateFromFood(action.food),
      };
    case ActionType.UPDATE_FOOD:
      return {
        ...state,
        foodState: foodStateFromFood(action.food),
      };
    case ActionType.SET_NUTRIENT_INFOS:
      return {
        ...state,
        config: { ...state.config, nutrientInfos: action.nutrientInfos },
      };
    default:
      if (state.foodState?.stateType == "FoodView") {
        return {
          ...state,
          foodState: food_view.reducer(state.foodState, action),
        };
      } else if (state.foodState?.stateType == "BrandedFoodEdit") {
        return {
          ...state,
          foodState: branded_food_edit.reducer(state.foodState, action),
        };
      } else if (state.foodState?.stateType == "RecipeEdit") {
        return {
          ...state,
          foodState: recipe_edit.reducer(state.foodState, action),
        };
      } else {
        return state;
      }
  }
}

const logger = (store: any) => (next: any) => (action: any) => {
  console.log("dispatching", action);
  let result = next(action);
  console.log("next state", store.getState());
  return result;
};

export const store = createStore(
  rootReducer,
  applyMiddleware<ThunkDispatch>(thunk, <any>logger)
);
