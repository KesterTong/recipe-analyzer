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

import { Recipe } from "./Recipe";
import { Update, UpdateType } from "./Update";

export function updateRecipes(recipes: Recipe[], update: Update): Recipe[] {
  const recipe = recipes[update.recipeIndex];
  let newRecipe: Recipe;
  switch (update.type) {
    case UpdateType.ADD_INGREDIENT:
      const newIngredient = {
        amount: "",
        unit: "",
        ingredient: {
          description: "",
          url: null,
        },
        nutrientValues: [], // TODO: this is not correct.
      };
      newRecipe = {
        ...recipe,
        ingredients: recipe.ingredients.concat([newIngredient]),
      };
      break;
    case UpdateType.UPDATE_INGREDIENT:
      newRecipe = {
        ...recipe,
        ingredients: recipe.ingredients.map((ingredient, index) => {
          if (index != update.ingredientIndex) {
            return ingredient;
          }
          return {
            ...ingredient,
            amount:
              update.newAmount === undefined
                ? ingredient.amount
                : update.newAmount,
            unit:
              update.newUnit === undefined ? ingredient.unit : update.newUnit,
            ingredient:
              update.newFood === undefined
                ? ingredient.ingredient
                : update.newFood,
          };
        }),
      };
      break;
    case UpdateType.DELETE_INGREDIENT:
      newRecipe = {
        ...recipe,
        ingredients: recipe.ingredients.filter(
          (_, index) => index != update.ingredientIndex
        ),
      };
      break;
    case UpdateType.SWAP_INGREDIENTS:
      newRecipe = {
        ...recipe,
        ingredients: recipe.ingredients.map((ingredient, index) => {
          if (index == update.firstIngredientIndex) {
            return recipe.ingredients[index + 1];
          } else if (index == update.firstIngredientIndex + 1) {
            return recipe.ingredients[index - 1];
          } else {
            return ingredient;
          }
        }),
      };
      break;
  }
  return recipes.map((recipe, index) =>
    index == update.recipeIndex ? newRecipe : recipe
  );
}
