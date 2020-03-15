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
import * as food_searcher_actions from "./food_searcher/actions";
import * as branded_food_actions from "./branded_food/actions";
import * as recipe_actions from "./recipe/actions";
import { Recipe } from "../../core/Recipe";
import { BrandedFoodAction, BrandedFoodState } from "./branded_food/types";
import { RecipeAction, RecipeState } from "./recipe/types";
import { loadIngredient } from "./recipe/actions";
import { FoodSearcherAction } from "./food_searcher/types";

export interface SetNutrientInfos {
  type: 'SetNutrientInfos',
  nutrientInfos: NutrientInfo[],
}

export interface UpdatedFoodSearcher {
  type: 'UpdateFoodSearcher',
  action: FoodSearcherAction
}

export interface SetFood {
  type: 'SetFood',
  food: SRLegacyFood | RecipeState | BrandedFoodState | null,
}

export interface UpdateBrandedFood {
  type: 'UpdateBrandedFood',
  action: BrandedFoodAction,
}

export interface UpdateRecipe {
  type: 'UpdateRecipe',
  action: RecipeAction,
}

export type Action = SetNutrientInfos | UpdatedFoodSearcher | SetFood | UpdateBrandedFood | UpdateRecipe;

function compose1<T,U,V>(f: (arg0: T) => U, g: (arg0: U) => V): (arg0: T) => V {
  return (arg0: T) => g(f(arg0));
}

function compose2<T0, T1, U,V>(f: (arg0: T0, arg1: T1) => U, g: (arg0: U) => V): (arg0: T0, arg1: T1) => V {
  return (arg0: T0, arg1: T1) => g(f(arg0, arg1));
}

function wrapBrandedFoodAction(action: BrandedFoodAction): Action {
  return {type: 'UpdateBrandedFood', action};
}

export const updateBrandedFoodDescription = compose1(
  branded_food_actions.updateDescription, wrapBrandedFoodAction);

export const updateBrandedFoodServingSize = compose1(
  branded_food_actions.updateServingSize, wrapBrandedFoodAction);

export const updateBrandedFoodServingSizeUnit = compose1(
  branded_food_actions.updateServingSizeUnit, wrapBrandedFoodAction);

export const updateBrandedFoodHouseholdUnit = compose1(
  branded_food_actions.updateHouseholdUnit, wrapBrandedFoodAction);

export const updateBrandedFoodNutrientValue = compose2(
  branded_food_actions.updateNutrientValue, wrapBrandedFoodAction);

export const updateBrandedFoodSelectedQuantity = compose1(
  branded_food_actions.setSelectedQuantity, wrapBrandedFoodAction);

function wrapRecipeAction(action: RecipeAction): Action {
  return {type: 'UpdateRecipe', action};
}

function wrapRecipeThunk(thunk: (dispatch: Dispatch<RecipeAction>, getState: () => RecipeState) => void) {
  return (dispatch: Dispatch<Action>, getState: () => RootState) => {
    thunk((action: RecipeAction) => dispatch(wrapRecipeAction(action)), () => getState().food as RecipeState);
  };
}

export const updateRecipeDescription = compose1(
  recipe_actions.updateDescription, wrapRecipeAction);

export const addRecipeIngredient = compose1(
  recipe_actions.addIngredient, wrapRecipeThunk);

export const updateRecipeIngredientAmount = compose2(
  recipe_actions.updateIngredientAmount, wrapRecipeAction);

export const updateRecipeIngredientUnit = compose2(
  recipe_actions.updateIngredientUnit, wrapRecipeAction);
      
export const updateRecipeIngredient = compose2(
  recipe_actions.updateIngredientId, wrapRecipeThunk);
  
  

function brandedFoodFromState(state: BrandedFoodState): BrandedFood {
  let servingSize = Number(state.servingSize);
  let foodNutrients = state.foodNutrients.map(nutrient => ({
    nutrient: {id: nutrient.id},
    amount: Number(nutrient.amount) * 100 / servingSize,
  }));
  return {
    dataType: 'Branded',
    description: state.description,
    servingSize,
    servingSizeUnit: state.servingSizeUnit,
    householdServingFullText: state.householdServingFullText,
    foodNutrients,
  }
}

function editStateFromBrandedFood(food: BrandedFood): BrandedFoodState {
  let foodNutrients = food.foodNutrients.map(nutrient => ({
    id: nutrient.nutrient.id,
    amount: ((nutrient.amount || 0) * food.servingSize / 100).toString(),
  }));
  return {
    dataType: 'Branded Edit',
    description: food.description,
    servingSize: food.servingSize.toString(),
    servingSizeUnit: food.servingSizeUnit,
    householdServingFullText: food.householdServingFullText || '',
    foodNutrients,
    selectedQuantity: 0,
  }
}

export function saveFood() {
  return (dispatch: Dispatch<Action>, getState: () => RootState) => {
    let state = getState();
    if (state.food?.dataType == 'Branded Edit') {
      let updatedFood = brandedFoodFromState(state.food);
      new IngredientDatabaseImpl().patchFood(state.foodSearcher.selected!.foodId, updatedFood);
    } else if (state.food?.dataType == 'Recipe Edit') {
      new IngredientDatabaseImpl().patchFood(state.foodSearcher.selected!.foodId, state.food.recipe); 
    }
  }
}

export function selectFood(foodRef: FoodRef | null) {
  return async (dispatch: Dispatch<Action>, getState: () => RootState) => {
    if (foodRef == null) {
      dispatch({type: 'UpdateFoodSearcher', action: {type: 'Deselect'}});
      return;
    }
    dispatch({
      type: 'UpdateFoodSearcher',
      action: {type: 'SelectFood', selected: foodRef},
    });
    let ingredientDatabase = new IngredientDatabaseImpl()
    const food = await ingredientDatabase.getFood(foodRef.foodId);
    if (food == null) {
      return dispatch({
        type: 'SetFood',
        food: null, 
      })
    }
    switch (food.dataType) {
      case 'Branded':
        return dispatch({
          type: 'SetFood',
          food: editStateFromBrandedFood(food), 
        });
      case 'Recipe':
        food.ingredientsList.forEach(ingredient => wrapRecipeThunk(loadIngredient(ingredient.foodId))(dispatch, getState));
        return dispatch({
          type: 'SetFood',
          food: {
            dataType: 'Recipe Edit',
            recipe: food,
            foodsById: {},
          },
        });
      case 'SR Legacy':
        return dispatch({type: 'SetFood', food});
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
    dispatch({
      type: 'UpdateFoodSearcher',
      action: {type: 'SelectFood', selected: {foodId, description}},
    });
    dispatch({
      type: 'SetFood',
      food: editStateFromBrandedFood(food),
    });
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
    dispatch({
      type: 'UpdateFoodSearcher',
      action: food_searcher_actions.selectFood({foodId, description}),
    });
    dispatch({
      type: 'SetFood',
      food: {
        dataType: 'Recipe Edit',
        recipe: food,
        foodsById: {},
      },
    });
  } 
}
