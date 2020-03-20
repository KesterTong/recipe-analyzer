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
import { State } from "./types";
import { initialState, RootAction, ActionType } from "../types";

export function reducer(state: State | null = initialState.srLegacyFoodState, action: RootAction): State | null {
  switch(action.type) {
    case ActionType.SELECT_FOOD:
    case ActionType.UPDATE_FOOD:
      return action.food?.dataType == 'SR Legacy' && action.food ? {
        srLegacyFood: action.food,
        selectedQuantity: 0,
      } : null;
    case ActionType.SET_SELECTED_QUANTITY:
      return state ? {...state, selectedQuantity: action.index} : null;
    default:
      return state;
  }
}