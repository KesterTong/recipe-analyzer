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
import { ThunkResult } from "..";
import { brandedFoodFromState } from "./conversion";
import { patchFood } from "../../database";
import { BrandedFood } from "../../../core/FoodDataCentral";

export function updateAfterSave(food: BrandedFood): Action {
  return { type: ActionType.UPDATE_AFTER_SAVE, food };
}

export function updateServingSize(servingSize: string): Action {
  return { type: ActionType.UPDATE_SERVING_SIZE, servingSize };
}

export function updateServingSizeUnit(servingSizeUnit: string): Action {
  return { type: ActionType.UPDATE_SERVING_SIZE_UNIT, servingSizeUnit };
}

export function updateHouseholdUnit(householdUnit: string): Action {
  return { type: ActionType.UPDATE_HOUSEHOLD_UNIT, householdUnit };
}

export function updateNutrientValue(nutrientId: number, value: string): Action {
  return { type: ActionType.UPDATE_NUTRIENT_VALUE, nutrientId, value };
}

export function maybeSave(): ThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    let state = getState();
    let foodId = state.selectedFood.foodRef?.foodId;
    if (foodId != null && state.brandedFoodState) {
      const food = brandedFoodFromState(state.brandedFoodState);
      await patchFood(foodId, food);
      dispatch(updateAfterSave(food));
    }
  };
}
