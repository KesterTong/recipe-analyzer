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
import { FoodRef } from "../core/FoodRef";
import { Dispatch } from "react";
import { IngredientDatabaseImpl } from "./IngredientDatabaseImpl";
import { Food } from "../core/Food";
import { NutrientInfo } from "../core/Nutrients";
import { RootState, BrandedFoodEdits } from "./RootState";
import { BrandedFood, SRLegacyFood } from "../core/FoodDataCentral";
import { Recipe } from "../core/Recipe";

export interface SetEditMode {
  type: 'SetEditMode',
  editMode: boolean,
}

export interface SetNutrientInfos {
  type: 'SetNutrientInfos',
  nutrientInfos: NutrientInfo[],
}

export interface SelectFood {
  type: 'SelectFood',
  foodId: string,
  description: string | null, 
}

export interface SetFood {
  type: 'SetFood',
  food: SRLegacyFood | Recipe | BrandedFoodEdits | null,
}

export interface SetFoodForId {
  type: 'SetFoodForId',
  food: Food,
  foodId: string,
}

export interface UpdateDescription {
  type: 'UpdateDescription',
  description: string,
}

export interface UpdateServingSize {
  type: 'UpdateServingSize',
  servingSize: string,
}

export interface UpdateServingSizeUnit {
  type: 'UpdateServingSizeUnit',
  servingSizeUnit: string,
}

export interface UpdateHouseholdUnit {
  type: 'UpdateHouseholdUnit',
  householdUnit: string,
}

export interface UpdateNutrientValue {
  type: 'UpdateNutrientValue',
  nutrientId: number,
  value: string,
}

export interface SetSelectedQuantity {
  type: 'SetSelectedQuantity',
  index: number,
}

export interface AddIngredient {
  type: 'AddIngredient',
  foodRef: FoodRef,
}

export interface UpdateIngredientAmount {
  type: 'UpdateIngredientAmount',
  index: number,
  amount: number,
}

export interface UpdateIngredientUnit {
  type: 'UpdateIngredientUnit',
  index: number,
  unit: string,
}

export interface UpdateIngredientId {
  type: 'UpdateIngredientId',
  index: number,
  foodRef: FoodRef,
}

export type Action = (
  SetNutrientInfos | SelectFood | SetFood | SetFoodForId | UpdateDescription | UpdateServingSize |
  UpdateServingSizeUnit | UpdateHouseholdUnit | UpdateNutrientValue | SetSelectedQuantity |
  AddIngredient | UpdateIngredientAmount | UpdateIngredientUnit | UpdateIngredientId);

export function updateDescription(description: string): Action {
  return {type: 'UpdateDescription', description};
}

function addRecipeIngredients(food: Food | null, dispatch: Dispatch<Action>, getState: () => RootState) {
  console.log(food)
  if (food?.dataType != 'Recipe') {
    return;
  }
  food.ingredientsList.map(ingredient => {
    let foodId = ingredient.foodId;
    if (getState().foodsById[foodId]) {
      return;
    }
    new IngredientDatabaseImpl().getFood(foodId).then(food => {
      if (food != null) {
        addRecipeIngredients(food, dispatch, getState);
        dispatch({type: 'SetFoodForId', food, foodId});
      }
    })
  })
}

export function addIngredient(foodRef: FoodRef) {
  return async (dispatch: Dispatch<Action>, getState:() => RootState) => {
    dispatch({type: 'AddIngredient', foodRef});
    const food = await new IngredientDatabaseImpl().getFood(foodRef.foodId);
    if (food == null) {
      return;
    }
    addRecipeIngredients(food, dispatch, getState)
    dispatch({type: 'SetFoodForId', food, foodId: foodRef.foodId});
  }
}

export function updateIngredientAmount(index: number, amount: number): Action {
  return {type: 'UpdateIngredientAmount', index, amount};
}

export function updateIngredientUnit(index: number, unit: string): Action {
  return {type: 'UpdateIngredientUnit', index, unit};
}

export function updateIngredientId(index: number, foodRef: FoodRef) {
  return async (dispatch: Dispatch<Action>) => {
    dispatch({type: 'UpdateIngredientId', index, foodRef});
    const food = await new IngredientDatabaseImpl().getFood(foodRef.foodId);
    if (food == null) {
      return;
    }
    dispatch({type: 'SetFoodForId', food, foodId: foodRef.foodId});
  }
}

function brandedFoodFromEditState(editState: BrandedFoodEdits): BrandedFood {
  let servingSize = Number(editState.servingSize);
  let foodNutrients = editState.foodNutrients.map(nutrient => ({
    nutrient: {id: nutrient.id},
    amount: Number(nutrient.amount) * 100 / servingSize,
  }));
  return {
    dataType: 'Branded',
    description: editState.description,
    servingSize,
    servingSizeUnit: editState.servingSizeUnit,
    householdServingFullText: editState.householdServingFullText,
    foodNutrients,
  }
}

function editStateFromBrandedFood(food: BrandedFood): BrandedFoodEdits {
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
  }
}

export function saveFood() {
  return (dispatch: Dispatch<Action>, getState: () => RootState) => {
    let state = getState();
    if (state.food?.dataType == 'Branded Edit') {
      let updatedFood = brandedFoodFromEditState(state.food);
      new IngredientDatabaseImpl().patchFood(state.foodId!, updatedFood);
    } else if (state.food?.dataType == 'Recipe') {
      new IngredientDatabaseImpl().patchFood(state.foodId!, state.food); 
    }
  }
}

export function selectFood(foodRef: FoodRef) {
  return async (dispatch: Dispatch<Action>, getState: () => RootState) => {
    dispatch({
      type: 'SelectFood',
      foodId: foodRef.foodId,
      description: foodRef.description,
    });
    if (foodRef.foodId == null) {
      return Promise.resolve();
    }
    let ingredientDatabase = new IngredientDatabaseImpl()
    const food = await ingredientDatabase.getFood(foodRef.foodId);
    let updated = food?.dataType == 'Branded' ? editStateFromBrandedFood(food) :food;
    addRecipeIngredients(food, dispatch, getState);
    return dispatch({
      type: 'SetFood',
      food: updated as (SRLegacyFood | Recipe | null), 
    });
  } 
}

export function newBrandedFood() {
  return async (dispatch: Dispatch<Action>) => {
    const food: BrandedFood = {
      dataType: 'Branded',
      description: 'New Food',
      servingSize: 100,
      servingSizeUnit: 'g',
      householdServingFullText: '1 serving',
      foodNutrients: [],
    };
    let foodId = await new IngredientDatabaseImpl().insertFood(food);
    dispatch({
      type: 'SelectFood',
      foodId,
      description: null,
    });
    dispatch({
      type: 'SetFood',
      food: editStateFromBrandedFood(food),
    });
  } 
}

export function newRecipe() {
  return async (dispatch: Dispatch<Action>) => {
    const food: Recipe = {
      dataType: 'Recipe',
      description: 'New Recipe',
      ingredientsList: [],
    };
    let foodId = await new IngredientDatabaseImpl().insertFood(food);
    dispatch({
      type: 'SelectFood',
      foodId,
      description: null,
    });
    dispatch({
      type: 'SetFood',
      food: food,
    });
  } 
}
