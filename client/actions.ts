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
import { IngredientIdentifier, FoodRef } from "../core/FoodRef";
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
  ingredientIdentifier: IngredientIdentifier,
  description: string | null, 
}

export interface SetFood {
  type: 'SetFood',
  food: SRLegacyFood | Recipe | BrandedFoodEdits | null,
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

export type Action = (
  SetNutrientInfos | SelectFood | SetFood | UpdateDescription | UpdateServingSize |
  UpdateServingSizeUnit | UpdateHouseholdUnit | UpdateNutrientValue | SetSelectedQuantity |
  AddIngredient | UpdateIngredientAmount | UpdateIngredientUnit);

export function updateDescription(description: string): Action {
  return {type: 'UpdateDescription', description};
}

export function addIngredient(foodRef: FoodRef): Action {
  console.log('got here')
  return {type: 'AddIngredient', foodRef};
}

export function updateIngredientAmount(index: number, amount: number): Action {
  return {type: 'UpdateIngredientAmount', index, amount};
}

export function updateIngredientUnit(index: number, unit: string): Action {
  return {type: 'UpdateIngredientUnit', index, unit};
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
      new IngredientDatabaseImpl().patchFood(state.ingredientIdentifier!, updatedFood);
    } else if (state.food?.dataType == 'Recipe') {
      new IngredientDatabaseImpl().patchFood(state.ingredientIdentifier!, state.food); 
    }
  }
}

export function selectFood(foodRef: FoodRef) {
  return async (dispatch: Dispatch<Action>) => {
    dispatch({
      type: 'SelectFood',
      ingredientIdentifier: foodRef.identifier,
      description: foodRef.description,
    });
    if (foodRef.identifier == null) {
      return Promise.resolve();
    }
    let ingredientDatabase = new IngredientDatabaseImpl()
    const food = await ingredientDatabase.getFood(foodRef.identifier);
    let updated = food?.dataType == 'Branded'? editStateFromBrandedFood(food) :food;
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
    let ingredientIdentifier = await new IngredientDatabaseImpl().insertFood(food);
    dispatch({
      type: 'SelectFood',
      ingredientIdentifier,
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
    let ingredientIdentifier = await new IngredientDatabaseImpl().insertFood(food);
    dispatch({
      type: 'SelectFood',
      ingredientIdentifier,
      description: null,
    });
    dispatch({
      type: 'SetFood',
      food: food,
    });
  } 
}
