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
import { State, ActionType } from "./types";
import { RootAction, ActionType as RootActionType } from "../types";
import { stateFromBrandedFood } from "./conversion";
import { initialState } from "../types";

export function reducer(state: State | null = initialState.brandedFoodState, action: RootAction): State | null {
  switch (action.type) {   
    case RootActionType.NEW_FOOD:
    case RootActionType.UPDATE_FOOD:
      return action.food?.dataType == 'Branded' ? stateFromBrandedFood(action.food) : null;
    case RootActionType.UPDATE_DESCRIPTION:
      return state ? {...state, description: action.description} : null;
    case RootActionType.SET_SELECTED_QUANTITY:
      return state ? {...state, selectedQuantity: action.index} : null;  
    case ActionType.UPDATE_SERVING_SIZE:
      return state ? {...state, servingSize: action.servingSize} : null;
    case ActionType.UPDATE_SERVING_SIZE_UNIT:
      return state ? {...state, servingSizeUnit: action.servingSizeUnit} : null;
    case ActionType.UPDATE_HOUSEHOLD_UNIT:
      return state ? {...state, householdServingFullText: action.householdUnit} : null;
    case ActionType.UPDATE_NUTRIENT_VALUE:
      if (state == null) {
        return null;
      }
      let foodNutrients = state.foodNutrients.map(nutrient =>
        nutrient.id == action.nutrientId ? {...nutrient, amount: action.value} : nutrient);
      return {...state, foodNutrients};
    default:
      return state;
  }
}