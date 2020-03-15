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
import { RecipeState, RecipeAction } from "./types";
import { IngredientBrowser } from "../../IngredientBrowser";

export function recipeReducer(state: RecipeState, action: RecipeAction): RecipeState {
  switch (action.type) {
    case 'UpdateRecipeDescription':
      return {
        ...state,
        description: action.description,
      }
    case 'SetFoodForId':
      return {
        ...state,
        foodsById: {
          ...state.foodsById, 
          [action.foodId]: action.food,
        }
      };
    case 'AddIngredient':
      return {
        ...state,
        ingredients: state.ingredients.concat([{
          quantity: {
            amount: 100,
            unit: 'g',
          },
          foodId: action.foodRef.foodId,
          deselected: false,
        }]),
      };
    case 'UpdateIngredientAmount':
      return {
        ...state,
        ingredients: state.ingredients.map((ingredient, index) => ({
          ...ingredient,
          quantity: {
            ...ingredient.quantity,
            amount: index == action.index ? action.amount: ingredient.quantity.amount,
          }
        })),
      };
    case 'UpdateIngredientUnit':
      return {
        ...state,
        ingredients: state.ingredients.map((ingredient, index) => ({
          ...ingredient,
          quantity: {
            ...ingredient.quantity,
            unit: index == action.index ? action.unit: ingredient.quantity.unit,
          }
        })),
      };
    case 'UpdateIngredientId':
      return {
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
      };
    case 'DeselectIngredient':
      return {
        ...state,
        ingredients: state.ingredients.map((ingredient, index) => {
          if (index == action.index) {
            return {...ingredient, deselected: true};
          } else {
            return ingredient;
          }
        }),
      }
  }
}