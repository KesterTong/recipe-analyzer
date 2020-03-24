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
import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import { RootState, initialState } from "./types";
import { reducer as brandedFoodReducer } from "./branded_food/reducer";
import {
  State as BrandedFoodState,
  ActionType as BrandedFoodActionType,
} from "./branded_food/types";
import { deselect, select, updateDescription } from "./food_input/actions";
import { reducer as recipeReducer } from "./recipe/reducer";
import { State as SRLegacyFoodState } from "./sr_legacy_food/types";
import { reducer as foodInputReducer } from "./food_input/reducer";
import { stateFromBrandedFood } from "./branded_food/conversion";
import {
  State as RecipeState,
  ActionType as RecipeActionType,
} from "./recipe/types";
import { stateFromRecipe } from "./recipe/conversion";
import { SRLegacyFood } from "../../core/FoodDataCentral";
import { Food } from "../../core/Food";

export { RootState, BrandedFoodState, RecipeState, ThunkDispatch, ThunkResult };

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
  selectedFood: (state = initialState.selectedFood, action) => {
    switch (action.type) {
      case ActionType.DESELECT:
        return foodInputReducer(state, deselect());
      case ActionType.SELECT_FOOD:
        return foodInputReducer(state, select(action.foodRef));
      case ActionType.NEW_FOOD:
        return foodInputReducer(
          state,
          select({
            foodId: action.foodId,
            description: action.food.description,
          })
        );
      case ActionType.UPDATE_RECIPE:
        if (action.action.type != RecipeActionType.UPDATE_DESCRIPTION) {
          return state;
        }
        return foodInputReducer(
          state,
          updateDescription(action.action.description)
        );
      case ActionType.UPDATE_BRANDED_FOOD:
        if (action.action.type != BrandedFoodActionType.UPDATE_DESCRIPTION) {
          return state;
        }
        return foodInputReducer(
          state,
          updateDescription(action.action.description)
        );
      case ActionType.UPDATE_FOOD:
        return foodInputReducer(
          state,
          updateDescription(action.food.description)
        );
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
  ): SRLegacyFoodState | RecipeState | BrandedFoodState | null => {
    switch (action.type) {
      case ActionType.SELECT_FOOD:
        return null;
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
