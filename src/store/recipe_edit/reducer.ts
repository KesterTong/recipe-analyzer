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
import { ActionType, State, Ingredient } from "./types";
import { RootAction } from "../types";
import { Food, servingEquivalentQuantities, getIngredientUnits } from "../../core";

function updateIngredient(
  state: State,
  updateIndex: number,
  updateFn: (ingredient: Ingredient) => Ingredient
) {
  return {
    ...state,
    ingredients: state.ingredients.map((ingredient, index) =>
      index == updateIndex && ingredient ? updateFn(ingredient) : ingredient
    ),
  };
}

function defaultUnit(food: Food) {
  const units = getIngredientUnits(servingEquivalentQuantities(food));
  // Units should never be empty. 
  return units[0];
}

function defaultAmount(unit: string): number {
  return unit == 'g' || unit == 'ml' ? 100 : 1;
}

export function reducer(state: State, action: RootAction): State {
  switch (action.type) {
    case ActionType.UPDATE_DESCRIPTION:
      return { ...state, description: action.description };
    case ActionType.ADD_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.concat([
          {
            amount: null,
            unit: null,
            foodId: null,
            selected: null,
            food: null,
            nutrientsPerServing: null,
          },
        ]),
      };
    case ActionType.DELETE_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.filter(
          (_, index) => index != action.index
        ),
      };
    case ActionType.UPDATE_INGREDIENT_AMOUNT:
      return updateIngredient(state, action.index, (ingredient) => ({
        ...ingredient,
        amount: action.amount,
      }));
    case ActionType.UPDATE_INGREDIENT_UNIT:
      return updateIngredient(state, action.index, (ingredient) => ({
        ...ingredient,
        unit: action.unit,
      }));
    case ActionType.UPDATE_INGREDIENT_FOOD:
      return updateIngredient(state, action.index, (ingredient) => {
        const unit = ingredient.unit || defaultUnit(action.food);
        const amount = ingredient.amount == null ? defaultAmount(unit) : ingredient.amount;
        return {
          ...ingredient,
          amount,
          unit,
          selected: {
            foodId: ingredient.foodId!,
            description: action.food.description,
          },
          food: action.food,
        };
      });
    case ActionType.UPDATE_INGREDIENT_NUTRIENTS_PER_SERVING:
      return updateIngredient(state, action.index, (ingredient) => ({
        ...ingredient,
        nutrientsPerServing: action.nutrientsPerServing,
      }));
    case ActionType.SELECT_INGREDIENT:
      return updateIngredient(state, action.index, (ingredient) => {
        // If the ingredient is deselected, just update UI state.
        if (action.selected == null) {
          return {
            ...ingredient,
            selected: null,
          }
        }
        return {
          amount: null,  // Don't know a good default yet.
          unit: null,  // Same here.
          foodId: action.selected.foodId,
          selected: action.selected,
          food: null,
          nutrientsPerServing: null,
        };
      });
    default:
      return state;
  }
}
