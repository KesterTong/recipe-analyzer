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
import { ActionType, Edits } from "./types";
import { RootAction, ActionType as RootActionType } from "../types";

export function reducer(edits: Edits, action: RootAction): Edits {
  switch (action.type) {
    case RootActionType.UPDATE_DESCRIPTION:
      return { ...edits, description: action.description };
    case RootActionType.SET_SELECTED_QUANTITY:
      return { ...edits, selectedQuantity: action.index };
    case ActionType.UPDATE_SERVING_SIZE:
      return { ...edits, servingSize: action.servingSize };
    case ActionType.UPDATE_SERVING_SIZE_UNIT:
      return { ...edits, servingSizeUnit: action.servingSizeUnit };
    case ActionType.UPDATE_HOUSEHOLD_UNIT:
      return { ...edits, householdServingFullText: action.householdUnit };
    case ActionType.UPDATE_NUTRIENT_VALUE:
      return {
        ...edits,
        foodNutrients: edits.foodNutrients.map((nutrient) =>
          nutrient.id == action.nutrientId
            ? { ...nutrient, amount: action.value }
            : nutrient
        ),
      };
    default:
      return edits;
  }
}
