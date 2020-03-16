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

import { FoodRef } from "../../core/FoodRef";
import { Dispatch } from "react";
import { IngredientDatabaseImpl } from "../IngredientDatabaseImpl";
import { Food } from "../../core/Food";
import { NutrientInfo } from "../../core/Nutrients";
import { RootState } from "./RootState";
import { BrandedFood, SRLegacyFood } from "../../core/FoodDataCentral";
import { Recipe } from "../../core/Recipe";
import { Action as BrandedFoodAction, BrandedFoodState } from "./branded_food/types";
import { RecipeAction } from "./recipe/types";
import { recipeFromState } from './recipe/conversion';
import { loadIngredient } from "./recipe/actions";
import { brandedFoodFromState } from "./branded_food/conversion";

export interface SetNutrientInfos {
  type: 'SetNutrientInfos',
  nutrientInfos: NutrientInfo[],
}

export interface Deselect {
  type: 'Deselect';
}

export interface SelectFood {
  type: 'SelectFood',
  foodId: string,
  description: string | null,
}

export interface SetFood {
  type: 'SetFood',
  food: Food,
}

export type Action = SetNutrientInfos | Deselect | SelectFood | SetFood | BrandedFoodAction | RecipeAction;

export function saveFood() {
  return (dispatch: Dispatch<Action>, getState: () => RootState) => {
    let state = getState();
    let food: Food;
    if (state.food == null) {
      return;
    }
    switch (state.food.dataType) {
      case 'Branded Edit':
        food = brandedFoodFromState(state.food);
        break;
      case 'Recipe Edit':
        food = recipeFromState(state.food);
        break;
      default:
        return;
    }
    new IngredientDatabaseImpl().patchFood(state.selectedFoodId!, food);
  }
}

export function selectFood(selection: {label: string, value: string}[]) {
  return async (dispatch: Dispatch<Action>, getState: () => RootState) => {
    if (selection.length == 0) {
      dispatch({type: 'Deselect'});
      return;
    }
    const foodId = selection[0].value;
    dispatch({
      type: 'SelectFood',
      foodId,
      description: selection[0].label,
    });
    let ingredientDatabase = new IngredientDatabaseImpl()
    const food = await ingredientDatabase.getFood(foodId);
    if (food == null) {
      // TODO: handle this error.
      return;
    }
    dispatch({type: 'SetFood', food});
    if (food.dataType == 'Recipe') {
      food.ingredientsList.forEach(ingredient => {
        loadIngredient(ingredient.foodId)(dispatch)
      });
    }
  } 
}

export function newBrandedFood() {
  return async (dispatch: Dispatch<Action>) => {
    const description = 'New Food';
    const food: BrandedFood = {
      dataType: 'Branded',
      description,
      servingSize: 100,
      servingSizeUnit: 'g',
      householdServingFullText: '1 serving',
      foodNutrients: [],
    };
    let foodId = await new IngredientDatabaseImpl().insertFood(food);
    dispatch({type: 'SelectFood', foodId, description});
    dispatch({type: 'SetFood', food});
  } 
}

export function newRecipe() {
  return async (dispatch: Dispatch<Action>) => {
    const description = 'New Recipe';
    const food: Recipe = {
      dataType: 'Recipe',
      description,
      ingredientsList: [],
    };
    let foodId = await new IngredientDatabaseImpl().insertFood(food);
    dispatch({type: 'SelectFood', foodId, description});
    dispatch({type: 'SetFood', food});
  } 
}
