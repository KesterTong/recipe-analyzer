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
import { BrandedFoodState, BrandedFoodAction } from "./types";

export function brandedFoodReducer(state: BrandedFoodState, action: BrandedFoodAction): BrandedFoodState {
  switch (action.type) {
    case 'UpdateDescription':
      return {...state, description: action.description};
    case 'UpdateServingSize':
      return {...state, servingSize: action.servingSize};
    case 'UpdateServingSizeUnit':
      return {...state, servingSizeUnit: action.servingSizeUnit};
    case 'UpdateHouseholdUnit':
      return {...state, householdServingFullText: action.householdUnit};
    case 'UpdateNutrientValue':
      let foodNutrients = state.foodNutrients.map(nutrient =>
        nutrient.id == action.nutrientId ? {...nutrient, amount: action.value} : nutrient);
      return {...state, foodNutrients};
    case 'SetSelectedQuantity':
      return {...state, selectedQuantity: action.index};
  }
}