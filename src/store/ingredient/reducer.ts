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
import { Action, ActionType, State } from "./types";
import * as food_input from "../food_input";
import {
  Food,
  getIngredientUnits,
  servingEquivalentQuantities,
} from "../../core";

function defaultUnit(food: Food) {
  const units = getIngredientUnits(servingEquivalentQuantities(food));
  // Units should never be empty.
  return units[0];
}

function defaultAmount(unit: string): number {
  return unit == "g" || unit == "ml" ? 100 : 1;
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.UPDATE_AMOUNT:
      return {
        ...state,
        amount: action.amount,
      };
    case ActionType.UPDATE_UNIT:
      return {
        ...state,
        amount: defaultAmount(action.unit),
        unit: action.unit,
      };
    case ActionType.UPDATE_FOOD_INPUT:
      const resetIngredient = {
        amount: null, // Don't know a good default yet.
        unit: null, // Same here.
        food: null,
        nutrientsPerServing: null,
      };
      return {
        ...(action.action.type == food_input.ActionType.SELECT
          ? resetIngredient
          : state),
        selected: food_input.reducer(state.selected, action.action),
      };
  }
}
