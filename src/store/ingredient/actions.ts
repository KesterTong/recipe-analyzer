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

import { Action, ActionType } from "./types";
import { Food, Nutrients } from "../../core";

export function select(foodId: string, description: string): Action {
  return {
    type: ActionType.SELECT_FOOD,
    foodId,
    description,
  };
}

export function deselect(): Action {
  return {
    type: ActionType.DESELECT_FOOD,
  };
}

export function updateAmount(amount: number): Action {
  return {
    type: ActionType.UPDATE_AMOUNT,
    amount,
  };
}

export function updateUnit(unit: string): Action {
  return {
    type: ActionType.UPDATE_UNIT,
    unit,
  };
}

export function updateFood(food: Food): Action {
  return {
    type: ActionType.UPDATE_FOOD,
    food,
  };
}

export function updateNutrientsPerServing(
  nutrientsPerServing: Nutrients
): Action {
  return {
    type: ActionType.UPDATE_NUTRIENTS_PER_SERVING,
    nutrientsPerServing,
  };
}
