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
import { createStore, applyMiddleware } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";
import { RootState } from "./RootState";
import { brandedFoodReducer } from "./branded_food/reducer";
import { BrandedFoodState } from "./branded_food/types";
import { recipeReducer } from "./recipe/reducer";
import { BrandedFood } from "../../core/FoodDataCentral";

export { RootState, BrandedFoodState }

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

export function rootReducer(state: RootState | undefined, action: Action): RootState {
  if (state == undefined) {
    return {
      selectedFoodId: null,
      deselected: false,
      food: null,
      nutrientInfos: null,
    };
  }
  switch (action.type) {
    case 'Deselect':
      return {
        ...state,
        deselected: true,
      };
    case 'SelectFood':
      return {
        ...state,
        selectedFoodId: action.foodId,

      }
    case 'SetNutrientInfos':
      return {...state, nutrientInfos: action.nutrientInfos};
    case 'SetFood':
      switch (action.food.dataType) {
        case 'Branded':
          return {
            ...state,
            food: editStateFromBrandedFood(action.food),
          }
        case 'Recipe':
          return {
            ...state,
            food: {
              dataType: 'Recipe Edit',
              description: action.food.description,
              recipe: action.food,
              foodsById: {},
            },
          }
        case 'SR Legacy':
          return {...state, food: action.food};
      }
    case "UpdateRecipeDescription":
    case 'SetFoodForId':
    case "AddIngredient":
    case "UpdateIngredientAmount":
    case "UpdateIngredientUnit":
    case "UpdateIngredientId":
      if (state.food?.dataType == 'Recipe Edit') {
        return {...state, food: recipeReducer(state.food, action)}
      } else {
        return state;
      }
    case 'UpdateBrandedFoodDescription':
    case 'UpdateServingSize':
    case 'UpdateServingSizeUnit':
    case 'UpdateHouseholdUnit':
    case 'UpdateNutrientValue':
    case 'SetSelectedQuantity':
      if (state.food?.dataType == 'Branded Edit') {
        return {...state, food: brandedFoodReducer(state.food, action)}
      } else {
        return state;
      }
  }
}

export const store = createStore<RootState, Action, any, any>(
  rootReducer, applyMiddleware<ThunkDispatch<RootState, any, Action>, RootState>(thunk));