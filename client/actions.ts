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
import { IngredientIdentifier } from "../core/FoodRef";
import { Dispatch } from "react";
import { IngredientDatabaseImpl } from "./IngredientDatabaseImpl";
import { Food } from "../core/Food";
import { NutrientInfo } from "../core/Nutrients";
import { RootState, BrandedFoodEdits } from "./RootState";
import { BrandedFood } from "../core/FoodDataCentral";

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
  food: Food | BrandedFoodEdits | null,
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

export type Action = (
  SetNutrientInfos | SelectFood | SetFood | UpdateDescription | UpdateServingSize |
  UpdateServingSizeUnit | UpdateHouseholdUnit | UpdateNutrientValue | SetSelectedQuantity);

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

// TODO: make this setEditMode instead of toggleEditMode
export function toggleEditMode() {
  return (dispatch: Dispatch<Action>, getState: () => RootState) => {
    let state = getState();
    if (state.food?.dataType == 'Branded Edit') {
      let updatedFood = brandedFoodFromEditState(state.food);
      new IngredientDatabaseImpl().patchFood(state.ingredientIdentifier!, updatedFood);
      dispatch({type: 'SetFood', food: updatedFood});
    } else if (state.food?.dataType == 'Branded') {
      let editState = editStateFromBrandedFood(state.food);
      dispatch({type: 'SetFood', food: editState});
    }
  }
}

export function selectFood(ingredientIdentifier: IngredientIdentifier, description: string) {
  return async (dispatch: Dispatch<Action>) => {
    dispatch({
      type: 'SelectFood',
      ingredientIdentifier: ingredientIdentifier,
      description: description,
    });
    if (ingredientIdentifier == null) {
      return Promise.resolve();
    }
    let ingredientDatabase = new IngredientDatabaseImpl()
    const food = await ingredientDatabase.getFood(ingredientIdentifier);
    return dispatch({ type: 'SetFood', food: food });
  } 
}

export function newBrandedFood() {
  return async (dispatch: Dispatch<Action>) => {
    let result = await new IngredientDatabaseImpl().insertFood({
      dataType: 'Branded',
      description: 'New Food',
      servingSize: 100,
      servingSizeUnit: 'g',
      householdServingFullText: '1 serving',
      foodNutrients: [],
    });
    dispatch({
      type: 'SelectFood',
      ingredientIdentifier: result.ingredientIdentifier,
      description: null,
    });
    dispatch({
      type: 'SetFood',
      food: result.food,
    });
  } 
}

export function newRecipe() {
  return async (dispatch: Dispatch<Action>) => {
    let result = await new IngredientDatabaseImpl().insertFood({
      dataType: 'Recipe',
      description: 'New Recipe',
      ingredientsList: [],
    });
    dispatch({
      type: 'SelectFood',
      ingredientIdentifier: result.ingredientIdentifier,
      description: null,
    });
    dispatch({
      type: 'SetFood',
      food: result.food,
    });
  } 
}
