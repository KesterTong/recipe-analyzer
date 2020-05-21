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

import { RootState } from "./RootState";
import { RootAction, ActionType } from "./RootAction";
import { updateRecipes, UpdateType } from "../core";
import { createStore, applyMiddleware } from "redux";
import thunk, { ThunkDispatch as ReduxThunkDispatch } from "redux-thunk";

const initialState: RootState = { type: "Loading" };

function rootReducer(
  state: RootState | undefined,
  action: RootAction
): RootState {
  if (state === undefined) {
    return initialState;
  }
  switch (action.type) {
    case ActionType.INITIALIZE:
      return {
        type: "Active",
        recipes: action.recipes,
        selectedRecipeIndex: 0, // TODO: handle empty recipe set.
        selectedIngredientIndex: 0,
        fdcFoodsById: action.fdcFoodsById,
        config: action.config,
        conversionData: action.conversionData,
      };
    case ActionType.INITIALIZATION_ERROR:
      return {
        type: "Error",
        message: action.message,
      };
    case ActionType.UPDATE_RECIPES:
      if (state.type != "Active") {
        return state;
      }
      let selectedIngredientIndex = state.selectedIngredientIndex;
      if (action.update.recipeIndex == state.selectedRecipeIndex) {
        switch (action.update.type) {
          case UpdateType.ADD_INGREDIENT:
            const selectedRecipe = state.recipes[state.selectedRecipeIndex];
            selectedIngredientIndex = selectedRecipe.ingredients.length;
            break;
          case UpdateType.DELETE_INGREDIENT:
            if (selectedIngredientIndex == action.update.ingredientIndex) {
              selectedIngredientIndex = 0;
            }
            break;
          case UpdateType.SWAP_INGREDIENTS:
            if (selectedIngredientIndex == action.update.firstIngredientIndex) {
              selectedIngredientIndex = selectedIngredientIndex + 1;
            } else if (
              (selectedIngredientIndex = action.update.firstIngredientIndex + 1)
            ) {
              selectedIngredientIndex = selectedIngredientIndex - 1;
            }
            break;
        }
      }
      return {
        ...state,
        selectedIngredientIndex,
        recipes: updateRecipes(state.recipes, action.update),
      };
    case ActionType.UPDATE_FDC_FOODS:
      if (state.type != "Active") {
        return state;
      }
      return {
        ...state,
        fdcFoodsById: {
          ...state.fdcFoodsById,
          ...action.fdcFoodsById,
        },
      };
    case ActionType.SELECT_RECIPE:
      if (state.type != "Active") {
        return state;
      }
      return {
        ...state,
        selectedRecipeIndex: action.index,
      };
    case ActionType.SELECT_INGREDIENT:
      if (state.type != "Active") {
        return state;
      }
      return {
        ...state,
        selectedIngredientIndex: action.index,
      };
  }
}

const logger = (store: any) => (next: any) => (action: any) => {
  console.log("dispatching", action);
  let result = next(action);
  console.log("next state", store.getState());
  return result;
};

export type ThunkDispatch = ReduxThunkDispatch<
  RootState,
  undefined,
  RootAction
>;

export const store = createStore(
  rootReducer,
  applyMiddleware<ThunkDispatch>(thunk, <any>logger)
);
