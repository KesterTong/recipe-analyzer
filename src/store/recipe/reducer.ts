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
import { State, ActionType, Edits } from "./types";
import { RootAction, ActionType as RootActionType } from "../types";
import { initialState } from "../types";
import { stateFromRecipe } from "./conversion";
import { reducer as foodInputReducer } from "../food_input/reducer";
import { select, deselect, updateDescription } from "../food_input/actions";
import { initialState as foodInputInitialiState } from "../food_input/types";

export function editsReducer(edits: Edits, action: RootAction): Edits {
  switch (action.type) {
    case RootActionType.UPDATE_DESCRIPTION:
      return { ...edits, description: action.description };
    case ActionType.UPDATE_INGREDIENT_FOOD:
      return {
        ...edits,
        ingredients: edits.ingredients.map((ingredient, index) => {
          if (index != action.index) {
            return ingredient;
          }
          return {
            ...ingredient,
            normalizedFood: action.food,
            foodInputState: foodInputReducer(
              ingredient.foodInputState,
              updateDescription(action.food.description)
            ),
          };
        }),
      };
    case ActionType.ADD_INGREDIENT:
      return {
        ...edits,
        ingredients: edits.ingredients.concat([
          {
            quantity: {
              amount: 100,
              unit: "g",
            },
            foodInputState: foodInputInitialiState,
            normalizedFood: null,
          },
        ]),
      };
    case ActionType.DELETE_INGREDIENT:
      return {
        ...edits,
        ingredients: edits.ingredients.filter(
          (_, index) => index != action.index
        ),
      };
    case ActionType.UPDATE_INGREDIENT_AMOUNT:
      return {
        ...edits,
        ingredients: edits.ingredients.map((ingredient, index) => ({
          ...ingredient,
          quantity: {
            ...ingredient.quantity,
            amount:
              index == action.index
                ? action.amount
                : ingredient.quantity.amount,
          },
        })),
      };
    case ActionType.UPDATE_INGREDIENT_UNIT:
      return {
        ...edits,
        ingredients: edits.ingredients.map((ingredient, index) => ({
          ...ingredient,
          quantity: {
            ...ingredient.quantity,
            unit:
              index == action.index ? action.unit : ingredient.quantity.unit,
          },
        })),
      };
    case ActionType.SELECT_INGREDIENT:
      return {
        ...edits,
        ingredients: edits.ingredients.map((ingredient, index) => {
          if (index == action.index) {
            return {
              quantity: action.food.servingEquivalentQuantities["g"]
                ? { amount: 100, unit: "g" }
                : { amount: 1, unit: "serving" },
              foodInputState: foodInputReducer(
                undefined,
                select(action.foodRef)
              ),
              normalizedFood: action.food,
            };
          } else {
            return ingredient;
          }
        }),
      };
    case ActionType.DESELECT_INGREDIENT:
      return {
        ...edits,
        ingredients: edits.ingredients.map((ingredient, index) => {
          if (index == action.index) {
            return {
              ...ingredient,
              foodInputState: foodInputReducer(undefined, deselect()),
            };
          } else {
            return ingredient;
          }
        }),
      };
    default:
      return edits;
  }
}

export function reducer(
  state: State | null = initialState.recipeState,
  action: RootAction
): State | null {
  switch (action.type) {
    case RootActionType.SELECT_FOOD:
      return null;
    case RootActionType.NEW_FOOD:
    case RootActionType.UPDATE_FOOD:
      return action.food?.dataType == "Recipe"
        ? stateFromRecipe(action.food)
        : null;
    case RootActionType.UPDATE_AFTER_SAVE:
      return state && action.food?.dataType == "Recipe"
        ? { ...state, food: action.food }
        : state;
    default:
      if (state == null) {
        return state;
      } else {
        const newEdits = editsReducer(state.edits, action);
        return newEdits != state.edits ? { ...state, edits: newEdits } : state;
      }
  }
}
