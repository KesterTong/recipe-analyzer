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
import {
  RootState,
  RootAction,
  ActionType,
  ThunkDispatch,
  initialState,
} from "./types";

export * from "./actions";
export * from "./types";

function rootReducer(
  state: RootState = initialState,
  action: RootAction
): RootState {
  switch (action.type) {
    case ActionType.INITIALIZE:
      return {
        type: "Active",
        recipes: action.recipes,
        fdcFoodsById: action.fdcFoodsById,
        selectedRecipeIndex: 0, // TODO: handle empty recipe set.
        selectedIngredientIndex: 0, // TODO: handle empty ingredient list.
      };
    case ActionType.SET_ERROR:
      return {
        type: "Error",
        message: action.message,
      };
    case ActionType.SELECT_RECIPE:
      if (state.type != "Active") {
        return state;
      }
      return {
        ...state,
        selectedRecipeIndex: action.index,
        selectedIngredientIndex: 0,
      };
    case ActionType.SELECT_INGREDIENT:
      if (state.type != "Active") {
        return state;
      }
      return {
        ...state,
        selectedIngredientIndex: action.index,
      };
    case ActionType.ADD_INGREDIENT:
      if (state.type != "Active") {
        return state;
      }
      return {
        ...state,
        selectedIngredientIndex:
          state.recipes[state.selectedRecipeIndex].ingredients.length,
        recipes: state.recipes.map((recipe, index) => {
          if (index != action.recipeIndex) {
            return recipe;
          }
          return {
            ...recipe,
            ingredients: recipe.ingredients.concat([
              {
                amount: "",
                unit: "",
                ingredient: {
                  description: "",
                  url: null,
                },
                nutrientValues: [], // TODO: this is not correct.
              },
            ]),
          };
        }),
      };

    default:
      return state;
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
