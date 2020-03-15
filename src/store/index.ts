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
import { foodSearcherReducer } from "./food_searcher/reducer";

export { RootState, BrandedFoodState }

export function rootReducer(state: RootState | undefined, action: Action): RootState {
  if (state == undefined) {
    return {
      foodSearcher: {selected: null, state: 'Selected'},
      food: null,
      nutrientInfos: null,
    };
  }
  switch (action.type) {
    case 'UpdateFoodSearcher':
      return {
        ...state,
        foodSearcher: foodSearcherReducer(state.foodSearcher, action.action),
      };
    case 'SetNutrientInfos':
      return {...state, nutrientInfos: action.nutrientInfos};
    case 'SetFood':
      return {...state, food: action.food};
    case 'UpdateRecipe':
      if (state.food?.dataType == 'Recipe Edit') {
        return {...state, food: recipeReducer(state.food, action.action)}
      } else {
        return state;
      }
    case 'UpdateBrandedFood':
      if (state.food?.dataType == 'Branded Edit') {
        return {...state, food: brandedFoodReducer(state.food, action.action)}
      } else {
        return state;
      }
  }
}

export const store = createStore<RootState, Action, any, any>(
  rootReducer, applyMiddleware<ThunkDispatch<RootState, any, Action>, RootState>(thunk));