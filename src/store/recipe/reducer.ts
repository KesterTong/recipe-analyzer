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
import { ActionType, Edits, Ingredient, Action } from "./types";

function updateIngredient(
  edits: Edits,
  updateIndex: number,
  updateFn: (ingredient: Ingredient) => Ingredient
) {
  return {
    ...edits,
    ingredients: edits.ingredients.map((ingredient, index) =>
      index == updateIndex && ingredient ? updateFn(ingredient) : ingredient
    ),
  };
}

export function reducer(edits: Edits, action: Action): Edits {
  switch (action.type) {
    case ActionType.UPDATE_DESCRIPTION:
      return { ...edits, description: action.description };
    case ActionType.ADD_INGREDIENT:
      return {
        ...edits,
        ingredients: edits.ingredients.concat([null]),
      };
    case ActionType.DELETE_INGREDIENT:
      return {
        ...edits,
        ingredients: edits.ingredients.filter(
          (_, index) => index != action.index
        ),
      };
    case ActionType.UPDATE_INGREDIENT_AMOUNT:
      return updateIngredient(edits, action.index, (ingredient) => ({
        ...ingredient,
        quantity: { ...ingredient.quantity, amount: action.amount },
      }));
    case ActionType.UPDATE_INGREDIENT_UNIT:
      return updateIngredient(edits, action.index, (ingredient) => ({
        ...ingredient,
        quantity: { ...ingredient.quantity, unit: action.unit },
      }));
    case ActionType.UPDATE_INGREDIENT_FOOD:
      return updateIngredient(edits, action.index, (ingredient) => ({
        ...ingredient,
        description: action.description,
        normalizedFood: action.food,
      }));
    case ActionType.SELECT_INGREDIENT:
      return {
        ...edits,
        ingredients: edits.ingredients.map((ingredient, index) => {
          if (index != action.index) {
            return ingredient;
          }
          return {
            quantity: action.food.servingEquivalentQuantities["g"]
              ? { amount: 100, unit: "g" }
              : { amount: 1, unit: "serving" },
            foodId: action.foodRef.foodId,
            deselected: false,
            description: action.foodRef.description,
            normalizedFood: action.food,
          };
        }),
      };
    case ActionType.DESELECT_INGREDIENT:
      return updateIngredient(edits, action.index, (ingredient) => ({
        ...ingredient,
        deselected: true,
      }));
  }
}
