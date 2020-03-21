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
import { State } from './types';
import { Recipe } from '../../../core/Recipe';

export const NEW_RECIPE: Recipe = {
  dataType: 'Recipe',
  description: 'New Recipe',
  ingredientsList: [],
};

export function recipeFromState(state: State): Recipe {
  return {
    dataType: 'Recipe',
    description: state.description,
    ingredientsList: state.ingredients.map(ingredient => ({
      quantity: ingredient.quantity,
      foodId: ingredient.foodInputState.foodRef?.foodId!,
    })).filter(ingredient => ingredient.foodId),
  }
}

export function stateFromRecipe(food: Recipe): State {
  return {
    description: food.description,
    ingredients: food.ingredientsList.map(ingredient => ({
      quantity: ingredient.quantity,
      foodInputState: {
        foodRef: {foodId: ingredient.foodId, description: 'Loading...'},
        deselected: false,
      },
      normalizedFood: null,
    })),
  }
}