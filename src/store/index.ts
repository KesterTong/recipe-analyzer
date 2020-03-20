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
import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";
import { RootState, initialState } from "./RootState";
import { brandedFoodReducer } from "./branded_food/reducer";
import { State as BrandedFoodState, ActionType as BrandedFoodActionType } from "./branded_food/types";
import { recipeReducer } from "./recipe/reducer";
import { stateFromBrandedFood } from "./branded_food/conversion";
import { State as RecipeState, ActionType as RecipeActionType } from "./recipe/types";
import { stateFromRecipe } from './recipe/conversion';
import { SRLegacyFood } from "../../core/FoodDataCentral";
import { Food } from "../../core/Food";

export { RootState, BrandedFoodState, RecipeState }

function stateFromFood(food: Food): SRLegacyFood | BrandedFoodState | RecipeState {
  switch (food.dataType) {
    case 'Branded':
      return stateFromBrandedFood(food);
    case 'Recipe':
      return stateFromRecipe(food);
    case 'SR Legacy':
      return food;
  }
}

const rootReducer = combineReducers<RootState, Action>({
  selectedFood: (state = initialState.selectedFood, action) => {
    switch(action.type) {
      case 'Deselect':
        return {...state, deselected: true};
      case 'SelectFood':
        return {
          foodId: action.foodId,
          description: action.food ? action.food.description : null,
          deselected: false,
        }
      case 'UpdateFood':
        return {
          ...state,
          description: action.food.description,
        }
      default:
        return state;
    }
  },
  nutrientInfos: (state = initialState.nutrientInfos, action) => {
    switch (action.type) {
      case 'SetNutrientInfos':
        return action.nutrientInfos;
      default:
        return state;
    }
  },
  srLegacyFood: (state = initialState.srLegacyFood, action) => {
    switch(action.type) {
      case 'SelectFood':
      case 'UpdateFood':
        return action.food?.dataType == 'SR Legacy' ? action.food : null;
      default:
        return state;
    }
  },
  brandedFoodState: brandedFoodReducer,
  recipeState: recipeReducer,
})

//   if (state == undefined) {
//     return {
//       selectedFoodId: null,
//       deselected: false,
//       srLegacyFood: null,
//       recipeState: null,
//       brandedFoodState: null,
//       loadingFood: null,
//       nutrientInfos: null,
//     };
//   }
//   switch (action.type) {
//     case 'SelectFood':
//       return {...state, selectedFoodId: action.foodId, food: action.food && action.food.dataType != 'Loading' ? stateFromFood(action.food) : action.food};
//     case 'SetNutrientInfos':
//       return {...state, nutrientInfos: action.nutrientInfos};
//     case 'UpdateFood':
//       if (state.selectedFoodId != action.foodId) {
//         return state;
//       }
//       return {...state, food: stateFromFood(action.food)};
//     case RecipeActionType.UPDATE_DESCRIPTION:
//     case RecipeActionType.SET_FOOD_FOR_ID:
//     case RecipeActionType.ADD_INGREDIENT:
//     case RecipeActionType.UPDATE_INGREDIENT_AMOUNT:
//     case RecipeActionType.UPDATE_INGREDIENT_UNIT:
//     case RecipeActionType.UPDATE_INGREDIENT_ID:
//     case RecipeActionType.DESELECT_INGREDIENT:
//       if (state.food?.dataType == 'Recipe Edit') {
//         return {...state, food: recipeReducer(state.food, action)}
//       } else {
//         return state;
//       }
//     case BrandedFoodActionType.UPDATE_DESCRIPTION:
//     case BrandedFoodActionType.UPDATE_SERVING_SIZE:
//     case BrandedFoodActionType.UPDATE_SERVING_SIZE_UNIT:
//     case BrandedFoodActionType.UPDATE_HOUSEHOLD_UNIT:
//     case BrandedFoodActionType.UPDATE_NUTRIENT_VALUE:
//     case BrandedFoodActionType.SET_SELECTED_QUANTITY:
//       if (state.food?.dataType == 'Branded Edit') {
//         return {...state, food: brandedFoodReducer(state.food, action)}
//       } else {
//         return state;
//       }
//   }
// }

export const store = createStore(
  rootReducer,
  applyMiddleware<ThunkDispatch<RootState, undefined, Action>>(thunk));