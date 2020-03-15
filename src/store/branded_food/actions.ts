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
import { BrandedFoodAction, BrandedFoodState } from "./types";
import { BrandedFood } from "../../../core/FoodDataCentral";

export function updateDescription(description: string): BrandedFoodAction {
  return {type: 'UpdateDescription', description};
}

export function updateServingSize(servingSize: string): BrandedFoodAction {
  return {type: 'UpdateServingSize', servingSize};
}

export function updateServingSizeUnit(servingSizeUnit: string): BrandedFoodAction {
  return {type: 'UpdateServingSizeUnit', servingSizeUnit};
}

export function updateHouseholdUnit(householdUnit: string): BrandedFoodAction {
  return {type: 'UpdateHouseholdUnit', householdUnit};
}

export function updateNutrientValue(nutrientId: number, value: string): BrandedFoodAction {
  return {type: 'UpdateNutrientValue', nutrientId, value};
}

export function setSelectedQuantity(index: number): BrandedFoodAction {
  return {type: 'SetSelectedQuantity', index};
}