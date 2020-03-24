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
import { ActionType, Action, State } from "./types";

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.UPDATE_DESCRIPTION:
      return { ...state, description: action.description };
    case ActionType.UPDATE_SERVING_SIZE:
      return { ...state, servingSize: action.servingSize };
    case ActionType.UPDATE_SERVING_SIZE_UNIT:
      return { ...state, servingSizeUnit: action.servingSizeUnit };
    case ActionType.UPDATE_HOUSEHOLD_UNIT:
      return { ...state, householdServingFullText: action.householdUnit };
    case ActionType.UPDATE_NUTRIENT_VALUE:
      return {
        ...state,
        foodNutrients: state.foodNutrients.map((nutrient) =>
          nutrient.id == action.nutrientId
            ? { ...nutrient, amount: action.value }
            : nutrient
        ),
      };
  }
}
