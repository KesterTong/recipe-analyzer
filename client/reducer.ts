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

import { Action } from "./actions";
import { RootState } from "./RootState";
import { IngredientDatabaseImpl } from "./IngredientDatabaseImpl";
import { Food } from "../core/Food";

function _toggleEditMode(state: RootState): RootState {
  if (state.editMode) {
    // TODO: move this to the action creator, dispatch is supposed to be pure.
    new IngredientDatabaseImpl().patchFood(state.ingredientIdentifier!, state.food as Food);
  }
  return {...state, editMode: !state.editMode};
}

export function reducer(state: RootState | undefined, action: Action): RootState {
  if (state == undefined) {
    return {
      ingredientIdentifier: null,
      food: null,
      nutrientInfos: null,
      editMode: false,
      selectedQuantity: 0,
    };
  }
  switch (action.type) {
    case 'ToggleEditMode':
      return _toggleEditMode(state);
    case 'SelectFood':
      return {
        ...state,
        ingredientIdentifier: action.ingredientIdentifier,
        food: action.description ? {dataType: 'Loading', description: action.description} : null,
        editMode: false,
        selectedQuantity: 0,  // Reset selected quantity.
      };
    case 'SetNutrientInfos':
      return {...state, nutrientInfos: action.nutrientInfos};
    case 'SetFood':
      return {
        ...state,
        food: action.food,
      };
    case 'UpdateDescription':
      if (state.food && state.food.dataType == 'Branded') {
        return {...state, food: {...state.food, description: action.description}};
      }
      return state;
    case 'UpdateServingSize':
      if (state.food && state.food.dataType == 'Branded') {
        return {...state, food: {...state.food, servingSize: action.servingSize}};
      }
      return state;
    case 'UpdateServingSizeUnit':
      if (state.food && state.food.dataType == 'Branded') {
        return {...state, food: {...state.food, servingSizeUnit: action.servingSizeUnit}};
      }
      return state;
    case 'UpdateHouseholdUnit':
      if (state.food && state.food.dataType == 'Branded') {
        return {...state, food: {...state.food, householdServingFullText: action.householdUnit}};
      }
      return state;
    case 'UpdateNutrientValue':
      if (state.food && state.food.dataType == 'Branded') {
        let foodNutrients = state.food.foodNutrients.map(nutrient =>
          nutrient.nutrient.id == action.nutrientId ? {...nutrient, amount: action.value} : nutrient);
        return {...state, food: {...state.food, foodNutrients}};
      }
      return state;
    case 'SetSelectedQuantity':
      return {...state, selectedQuantity: action.index};
  }
}