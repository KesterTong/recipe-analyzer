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
import { State, ActionType } from "./types";
import { RootAction, ActionType as RootActionType } from "../types";
import { initialState } from "../types";
import { stateFromRecipe } from "./conversion";

export function reducer(state: State | null = initialState.recipeState, action: RootAction): State | null{
  switch (action.type) {
    case RootActionType.SELECT_FOOD:
    case RootActionType.UPDATE_FOOD:
      return action.food?.dataType == 'Recipe' ? stateFromRecipe(action.food) : null;
    case RootActionType.UPDATE_DESCRIPTION:
      return state ? {
        ...state,
        description: action.description,
      } : null;
    case ActionType.SET_FOOD_FOR_ID:
      return state ? {
        ...state,
        foodsById: {
          ...state.foodsById, 
          [action.foodId]: action.food,
        }
      } : null;
    case ActionType.ADD_INGREDIENT:
      return state ? {
        ...state,
        ingredients: state.ingredients.concat([{
          quantity: {
            amount: 100,
            unit: 'g',
          },
          foodId: action.foodRef.foodId,
          deselected: false,
        }]),
      } : null;
    case ActionType.UPDATE_INGREDIENT_AMOUNT:
      return state ? {
        ...state,
        ingredients: state.ingredients.map((ingredient, index) => ({
          ...ingredient,
          quantity: {
            ...ingredient.quantity,
            amount: index == action.index ? action.amount: ingredient.quantity.amount,
          }
        })),
      } : null;
    case ActionType.UPDATE_INGREDIENT_UNIT:
      return state ? {
        ...state,
        ingredients: state.ingredients.map((ingredient, index) => ({
          ...ingredient,
          quantity: {
            ...ingredient.quantity,
            unit: index == action.index ? action.unit: ingredient.quantity.unit,
          }
        })),
      } : null;
    case ActionType.UPDATE_INGREDIENT_ID:
      return state ? {
        ...state,
        ingredients: state.ingredients.map((ingredient, index) => {
          if (index == action.index) {
            return {
              quantity: {amount: 100, unit: 'g'},
              foodId: action.foodId,
              deselected: false,
            }
          } else {
            return ingredient;
          }
        }),
      } : null;
    case ActionType.DESELECT_INGREDIENT:
      return state ? {
        ...state,
        ingredients: state.ingredients.map((ingredient, index) => {
          if (index == action.index) {
            return {...ingredient, deselected: true};
          } else {
            return ingredient;
          }
        }),
      } : null;
    default:
      return state;
  }
}