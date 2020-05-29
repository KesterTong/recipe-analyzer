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

import { Recipe, Ingredient } from "./Recipe";
import { Update, UpdateType } from "./Update";

const blankIngredient: Ingredient = {
  amount: "",
  unit: "",
  ingredient: {
    description: "",
    url: null,
  },
};

export function updateRecipes(recipes: Recipe[], update: Update): Recipe[] {
  const recipe = recipes[update.recipeIndex];
  let newIngredients: Ingredient[];
  switch (update.type) {
    case UpdateType.INSERT_INGREDIENT:
      newIngredients = [
        ...recipe.ingredients.slice(0, update.atIndex),
        blankIngredient,
        ...recipe.ingredients.slice(update.atIndex),
      ];
      break;
    case UpdateType.UPDATE_INGREDIENT:
      newIngredients = recipe.ingredients.map((ingredient, index) => {
        if (index != update.ingredientIndex) {
          return ingredient;
        }
        return {
          ...ingredient,
          amount:
            update.newAmount === undefined
              ? ingredient.amount
              : update.newAmount,
          unit: update.newUnit === undefined ? ingredient.unit : update.newUnit,
          ingredient:
            update.newFood === undefined
              ? ingredient.ingredient
              : update.newFood,
        };
      });
      break;
    case UpdateType.DELETE_INGREDIENT:
      newIngredients =
        recipe.ingredients.length == 1
          ? [blankIngredient]
          : recipe.ingredients.filter(
              (_, index) => index != update.ingredientIndex
            );
      break;
    case UpdateType.MOVE_INGREDIENT:
      newIngredients = recipe.ingredients.map((_, index) => {
        // The index that the current index should be copied from.
        let previousIndex: number;
        if (index == update.finalIngredientIndex) {
          // Case 1: This is the ingredient being moved.
          previousIndex = update.initialIngredientIndex;
        } else if (
          index < update.finalIngredientIndex &&
          index >= update.initialIngredientIndex
        ) {
          // Case 2: The ingredient is being moved down (increasing its index) and this
          // ingredient is being moved up one (decrementing index) to make room.
          previousIndex = index + 1;
        } else if (
          index > update.finalIngredientIndex &&
          index <= update.initialIngredientIndex
        ) {
          // Case 3: The ingredient is being moved up (decreasing its index) and this
          // ingredient is being moved odwn on (incrementing index) to make room.
          previousIndex = index - 1;
        } else {
          // Case 4: This ingredient is above or below the ingredients that change place.
          previousIndex = index;
        }
        return recipe.ingredients[previousIndex];
      });
      break;
  }
  return recipes.map((recipe, index) =>
    index == update.recipeIndex
      ? { ...recipe, ingredients: newIngredients }
      : recipe
  );
}
