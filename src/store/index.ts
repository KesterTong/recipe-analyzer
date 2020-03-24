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

import {
  RootAction,
  ActionType,
  ThunkDispatch,
  ThunkResult,
  LoadingState,
} from "./types";
import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import { RootState, initialState } from "./types";
import { reducer as brandedFoodReducer } from "./branded_food/reducer";
import {
  State as BrandedFoodState,
  ActionType as BrandedFoodActionType,
} from "./branded_food/types";
import { reducer as recipeReducer } from "./recipe/reducer";
import { State as SRLegacyFoodState } from "./sr_legacy_food/types";
import { stateFromBrandedFood } from "./branded_food/conversion";
import {
  State as RecipeState,
  ActionType as RecipeActionType,
} from "./recipe/types";
import { stateFromRecipe } from "./recipe/conversion";
import { SRLegacyFood } from "../../core/FoodDataCentral";
import { Food } from "../../core/Food";
import { selectFoodRef } from "./selectors";

export {
  RootState,
  BrandedFoodState,
  RecipeState,
  ThunkDispatch,
  ThunkResult,
  selectFoodRef,
};

function stateFromFood(
  food: Food
): SRLegacyFood | BrandedFoodState | RecipeState {
  switch (food.dataType) {
    case "Branded":
      return stateFromBrandedFood(food);
    case "Recipe":
      return stateFromRecipe(food);
    case "SR Legacy":
      return food;
  }
}

const rootReducer = combineReducers<RootState, RootAction>({
  foodId: (state = initialState.foodId, action) => {
    switch (action.type) {
      case ActionType.DESELECT:
        return state;
      case ActionType.SELECT_FOOD:
        return action.foodRef.foodId;
      case ActionType.NEW_FOOD:
        return action.foodId;
      default:
        return state;
    }
  },
  deselected: (state = initialState.deselected, action) => {
    switch (action.type) {
      case ActionType.DESELECT:
        return true;
      case ActionType.SELECT_FOOD:
      case ActionType.NEW_FOOD:
      case ActionType.UPDATE_RECIPE:
        return false;
      default:
        return state;
    }
  },
  nutrientNames: (state = initialState.nutrientNames, action) => {
    switch (action.type) {
      case ActionType.SET_NUTRIENT_INFOS:
        return action.nutrientInfos.map((nutrientInfo) => nutrientInfo.name);
      default:
        return state;
    }
  },
  nutrientIds: (state = initialState.nutrientIds, action) => {
    switch (action.type) {
      case ActionType.SET_NUTRIENT_INFOS:
        return action.nutrientInfos.map((nutrientInfo) => nutrientInfo.id);
      default:
        return state;
    }
  },
  foodState: (
    state = null,
    action
  ):
    | SRLegacyFoodState
    | RecipeState
    | BrandedFoodState
    | LoadingState
    | null => {
    switch (action.type) {
      case ActionType.SELECT_FOOD:
        return {
          stateType: "Loading",
          food: { description: action.foodRef.description },
        };
      case ActionType.NEW_FOOD:
      case ActionType.UPDATE_FOOD:
        switch (action.food.dataType) {
          case "Branded":
            return stateFromBrandedFood(action.food);
          case "Recipe":
            return stateFromRecipe(action.food);
          case "SR Legacy":
            return {
              stateType: "SRLegacyFood",
              food: action.food,
              selectedQuantity: 0,
            };
        }
      case ActionType.UPDATE_AFTER_SAVE:
        switch (state?.stateType) {
          case "BrandedFood":
            return action.food.dataType == "Branded"
              ? { ...state, food: action.food }
              : state;
          case "Recipe":
            return action.food.dataType == "Recipe"
              ? { ...state, food: action.food }
              : state;
          case "SRLegacyFood":
            return action.food.dataType == "SR Legacy"
              ? { ...state, food: action.food }
              : state;
          default:
            return state;
        }
      case ActionType.UPDATE_BRANDED_FOOD:
        if (state?.stateType != "BrandedFood") {
          return state;
        }
        return {
          ...state,
          edits: brandedFoodReducer(state.edits, action.action),
        };
      case ActionType.UPDATE_RECIPE:
        if (state?.stateType != "Recipe") {
          return state;
        }
        return { ...state, edits: recipeReducer(state.edits, action.action) };
      default:
        return state;
    }
  },
});

export const store = createStore(
  rootReducer,
  applyMiddleware<ThunkDispatch>(thunk)
);
