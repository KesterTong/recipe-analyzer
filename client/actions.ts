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
import { IngredientIdentifier } from "../core/FoodRef";
import { Dispatch } from "react";
import { IngredientDatabaseImpl } from "./IngredientDatabaseImpl";
import { Food } from "../core/Food";
import { normalizeFood } from "../core/normalizeFood";
import { NormalizedFood } from "../core/NormalizedFood";

export interface ToggleEditMode {
  type: 'ToggleEditMode',
}

export interface SelectFood {
  type: 'SelectFood',
  ingredientIdentifier: IngredientIdentifier | null,
}

export interface SetFood {
  type: 'SetFood',
  food: Food | null,
}

export interface SetNormalizedFood {
  type: 'SetNormalizedFood',
  normalizedFood: NormalizedFood | null,
}

export interface UpdateDescription {
  type: 'UpdateDescription',
  description: string,
}

export interface UpdateServingSize {
  type: 'UpdateServingSize',
  servingSize: number,
}

export interface UpdateServingSizeUnit {
  type: 'UpdateServingSizeUnit',
  servingSizeUnit: string,
}

export interface UpdateHouseholdUnit {
  type: 'UpdateHouseholdUnit',
  householdUnit: string,
}

export interface UpdateNutrientValue {
  type: 'UpdateNutrientValue',
  nutrientId: number,
  value: number,
}

export type Action = (
  ToggleEditMode | SelectFood | SetFood | SetNormalizedFood | UpdateDescription | UpdateServingSize |
  UpdateServingSizeUnit | UpdateHouseholdUnit | UpdateNutrientValue);

export function selectFood(dispatch: Dispatch<Action>, ingredientIdentifier: IngredientIdentifier | null) {
  dispatch({type: 'SelectFood', ingredientIdentifier: ingredientIdentifier});
  if (ingredientIdentifier == null) {
    return;
  }
  let ingredientDatabase = new IngredientDatabaseImpl()
  ingredientDatabase.getFood(ingredientIdentifier).then(food => {
    dispatch({type: 'SetFood', food: food})
    if (food == null) {
      return;
    }
    normalizeFood(food, ingredientDatabase).then(normalizedFood => {
      dispatch({type: 'SetNormalizedFood', normalizedFood: normalizedFood})
    });
  });
}
