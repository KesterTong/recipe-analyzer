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

import { RootAction, ActionType, ThunkDispatch, ThunkResult } from "./types";
import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import { RootState, initialState } from "./types";
import { reducer as brandedFoodReducer } from "./branded_food/reducer";
import { State as BrandedFoodState} from "./branded_food/types";
import { reducer as recipeReducer } from "./recipe/reducer";
import { reducer as srLegacyFoodReducer } from './sr_legacy_food/reducer';
import { stateFromBrandedFood } from "./branded_food/conversion";
import { State as RecipeState} from "./recipe/types";
import { stateFromRecipe } from './recipe/conversion';
import { SRLegacyFood } from "../../core/FoodDataCentral";
import { Food } from "../../core/Food";

export { RootState, BrandedFoodState, RecipeState, ThunkDispatch, ThunkResult }

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

const rootReducer = combineReducers<RootState, RootAction>({
  selectedFood: (state = initialState.selectedFood, action) => {
    switch(action.type) {
      case ActionType.DESELECT:
        return {...state, deselected: true};
      case ActionType.SELECT_FOOD:
        return {
          foodId: action.foodId,
          description: action.food ? action.food.description : null,
          deselected: false,
        }
      case ActionType.UPDATE_FOOD:
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
      case ActionType.SET_NUTRIENT_INFOS:
        return action.nutrientInfos;
      default:
        return state;
    }
  },
  srLegacyFoodState: srLegacyFoodReducer,
  brandedFoodState: brandedFoodReducer,
  recipeState: recipeReducer,
})

export const store = createStore(rootReducer, applyMiddleware<ThunkDispatch>(thunk));