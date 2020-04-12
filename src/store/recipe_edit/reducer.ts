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
import { ActionType, State } from "./types";
import { RootAction } from "../types";
import { reducer as ingredientReducer } from "../ingredient";

export function reducer(state: State, action: RootAction): State {
  switch (action.type) {
    case ActionType.UPDATE_DESCRIPTION:
      return { ...state, description: action.description };
    case ActionType.ADD_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.concat([
          {
            amount: null,
            unit: null,
            foodId: null,
            selected: null,
            food: null,
            nutrientsPerServing: null,
          },
        ]),
      };
    case ActionType.DELETE_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.filter(
          (_, index) => index != action.index
        ),
      };
    case ActionType.UPDATE_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.map((ingredient, index) =>
          index == action.index && ingredient
            ? ingredientReducer(ingredient, action.action)
            : ingredient
        ),
      };
    default:
      return state;
  }
}
