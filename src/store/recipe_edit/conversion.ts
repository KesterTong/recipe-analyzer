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
import { State } from "./types";
import { Recipe } from "../../core";

export const NEW_RECIPE: Recipe = {
  dataType: "Recipe",
  description: "New Recipe",
  ingredientsList: [],
};

function filterNulls<T>(array: (T | null)[]): T[] {
  return <T[]>array.filter((value) => value != null);
}

export function recipeFromState(state: State): Recipe {
  return {
    dataType: "Recipe",
    description: state.description,
    ingredientsList: filterNulls(
      state.ingredients.map((ingredient) => {
        if (
          ingredient.amount === null ||
          ingredient.unit === null ||
          ingredient.foodId === null
        ) {
          return null;
        }
        return {
          quantity: {
            amount: ingredient.amount,
            unit: ingredient.unit,
          },
          foodId: ingredient.foodId,
        };
      })
    ),
  };
}

export function stateFromRecipe(food: Recipe): State {
  return {
    stateType: "RecipeEdit",
    description: food.description,
    ingredients: food.ingredientsList.map((ingredient) => ({
      amount: ingredient.quantity.amount,
      unit: ingredient.quantity.unit,
      foodId: ingredient.foodId,
      selected: { foodId: ingredient.foodId, description: null },
      food: null,
      nutrientsPerServing: null,
    })),
  };
}
