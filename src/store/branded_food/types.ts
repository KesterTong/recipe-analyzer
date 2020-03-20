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

export interface State {
  servingSize: string,
  servingSizeUnit: string,
  householdServingFullText: string,
  description: string,
  foodNutrients: {id: number, amount: string}[],
  selectedQuantity: number,
}

export enum ActionType {
  UPDATE_SERVING_SIZE = '@branded_food/UpdateServingSize',
  UPDATE_SERVING_SIZE_UNIT = '@branded_food/UpdateServingSizeUnit',
  UPDATE_HOUSEHOLD_UNIT = '@branded_food/UpdateHouseholdUnit',
  UPDATE_NUTRIENT_VALUE = '@branded_food/UpdateNutrientValue',
};

export interface UpdateServingSize {
  type: ActionType.UPDATE_SERVING_SIZE,
  servingSize: string,
}

export interface UpdateServingSizeUnit {
  type: ActionType.UPDATE_SERVING_SIZE_UNIT,
  servingSizeUnit: string,
}

export interface UpdateHouseholdUnit {
  type: ActionType.UPDATE_HOUSEHOLD_UNIT,
  householdUnit: string,
}

export interface UpdateNutrientValue {
  type: ActionType.UPDATE_NUTRIENT_VALUE,
  nutrientId: number,
  value: string,
}

export type Action = UpdateServingSize | UpdateServingSizeUnit | UpdateHouseholdUnit | UpdateNutrientValue;