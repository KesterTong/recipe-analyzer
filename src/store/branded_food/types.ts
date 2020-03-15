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

export interface BrandedFoodState {
  dataType: 'Branded Edit',
  servingSize: string,
  servingSizeUnit: string,
  householdServingFullText: string,
  description: string,
  foodNutrients: {id: number, amount: string}[],
  selectedQuantity: number,
}

export interface UpdateDescription {
  type: 'UpdateBrandedFoodDescription',
  description: string,
}

export interface UpdateServingSize {
  type: 'UpdateServingSize',
  servingSize: string,
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
  value: string,
}

export interface SetSelectedQuantity {
  type: 'SetSelectedQuantity',
  index: number,
}

export type BrandedFoodAction = (
  UpdateDescription | UpdateServingSize | UpdateServingSizeUnit |
  UpdateHouseholdUnit | UpdateNutrientValue | SetSelectedQuantity);