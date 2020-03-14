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

export function reducer(state: RootState | undefined, action: Action): RootState {
  if (state == undefined) {
    return {
      foodId: null,
      food: null,
      foodsById: {},
      nutrientInfos: null,
      selectedQuantity: 0,
    };
  }
  switch (action.type) {
    case 'SelectFood':
      return {
        ...state,
        foodId: action.foodId,
        food: action.description ? {dataType: 'Loading', description: action.description} : null,
        selectedQuantity: 0,  // Reset selected quantity.
      };
    case 'SetNutrientInfos':
      return {...state, nutrientInfos: action.nutrientInfos};
    case 'SetFood':
      return {...state, food: action.food};
    case 'SetFoodForId':
      return {
        ...state,
        foodsById: {
          ...state.foodsById, 
          [action.foodId]: action.food,
        }
      };
    case 'UpdateDescription':
      if (state.food && state.food.dataType == 'Branded Edit') {
        return {...state, food: {...state.food, description: action.description}};
      } else if (state.food && state.food.dataType == 'Recipe') {
        return {...state, food: {...state.food, description: action.description}};
      }
      return state;
    case 'UpdateServingSize':
      if (state.food && state.food.dataType == 'Branded Edit') {
        return {...state, food: {...state.food, servingSize: action.servingSize}};
      }
      return state;
    case 'UpdateServingSizeUnit':
      if (state.food && state.food.dataType == 'Branded Edit') {
        return {...state, food: {...state.food, servingSizeUnit: action.servingSizeUnit}};
      }
      return state;
    case 'UpdateHouseholdUnit':
      if (state.food && state.food.dataType == 'Branded Edit') {
        return {...state, food: {...state.food, householdServingFullText: action.householdUnit}};
      }
      return state;
    case 'UpdateNutrientValue':
      if (state.food && state.food.dataType == 'Branded Edit') {
        let foodNutrients = state.food.foodNutrients.map(nutrient =>
          nutrient.id == action.nutrientId ? {...nutrient, amount: action.value} : nutrient);
        return {...state, food: {...state.food, foodNutrients}};
      }
      return state;
    case 'SetSelectedQuantity':
      return {...state, selectedQuantity: action.index};
    case 'AddIngredient':
      if (state.food?.dataType == 'Recipe') {
        return {
          ...state,
          food: {
            ...state.food,
            ingredientsList: state.food.ingredientsList.concat([{
              quantity: {
                amount: 100,
                unit: 'g',
              },
              foodId: action.foodRef.foodId,
            }])
          },
          foodsById: {
            ...state.foodsById,
            [action.foodRef.foodId]: {
              dataType: 'Loading',
              description: action.foodRef.description,
            },
          }
        };
      }      
      return state;
    case 'UpdateIngredientAmount':
      if (state.food?.dataType == 'Recipe') {
        return {
          ...state,
          food: {
            ...state.food,
            ingredientsList: state.food.ingredientsList.map((ingredient, index) => ({
              ...ingredient,
              quantity: {
                ...ingredient.quantity,
                amount: index == action.index ? action.amount: ingredient.quantity.amount,
              }
            })),
          },
        };
      }
      return state;
    case 'UpdateIngredientUnit':
      if (state.food?.dataType == 'Recipe') {
        return {
          ...state,
          food: {
            ...state.food,
            ingredientsList: state.food.ingredientsList.map((ingredient, index) => ({
              ...ingredient,
              quantity: {
                ...ingredient.quantity,
                unit: index == action.index ? action.unit: ingredient.quantity.unit,
              }
            })),
          },
        };
      }
      return state;
    case 'UpdateIngredientId':
      if (state.food?.dataType == 'Recipe') {
        return {
          ...state,
          food: {
            ...state.food,
            ingredientsList: state.food.ingredientsList.map((ingredient, index) => {
              if (index == action.index) {
                return {
                  quantity: {amount: 100, unit: 'g'},
                  foodId: action.foodRef.foodId,
                }
              } else {
                return ingredient;
              }
            }),
          },
          foodsById: {
            ...state.foodsById,
            [action.foodRef.foodId]: {
              dataType: 'Loading',
              description: action.foodRef.description,
            },
          }
        };
      }
      return state;
  }
}