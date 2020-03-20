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
import { Action } from "../actions";
import { stateFromBrandedFood } from "./conversion";
import { initialState } from "../RootState";

export function brandedFoodReducer(state: State | null = initialState.brandedFoodState, action: Action): State | null {
  switch (action.type) {   
    case 'SelectFood':
    case 'UpdateFood':
      return action.food?.dataType == 'Branded' ? stateFromBrandedFood(action.food) : null;
    case ActionType.UPDATE_DESCRIPTION:
      return state ? {...state, description: action.description} : null;
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
    case ActionType.SET_SELECTED_QUANTITY:
      return state ? {...state, selectedQuantity: action.index} : null;
    default:
      return state;
  }
}