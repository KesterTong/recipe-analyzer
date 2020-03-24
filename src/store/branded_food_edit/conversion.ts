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

import { State } from "./types";
import { BrandedFood } from "../../../core/FoodDataCentral";

// TODO: don't hardcode nutrients.
export const NEW_BRANDED_FOOD: BrandedFood = {
  dataType: "Branded",
  description: "New Food",
  servingSize: 100,
  servingSizeUnit: "g",
  householdServingFullText: "1 serving",
  foodNutrients: [
    { nutrient: { id: 1008 }, amount: 0 },
    { nutrient: { id: 1003 }, amount: 0 },
  ],
};

export function stateFromBrandedFood(food: BrandedFood): State {
  let foodNutrients = food.foodNutrients.map((nutrient) => ({
    id: nutrient.nutrient.id,
    amount: (((nutrient.amount || 0) * food.servingSize) / 100).toString(),
  }));
  return {
    stateType: "BrandedFoodEdit",
    description: food.description,
    servingSize: food.servingSize.toString(),
    servingSizeUnit: food.servingSizeUnit,
    householdServingFullText: food.householdServingFullText || "",
    foodNutrients,
    selectedQuantity: 0,
  };
}

export function brandedFoodFromState(state: State): BrandedFood {
  let servingSize = Number(state.servingSize);
  let foodNutrients = state.foodNutrients.map((nutrient) => ({
    nutrient: { id: nutrient.id },
    amount: (Number(nutrient.amount) * 100) / servingSize,
  }));
  return {
    dataType: "Branded",
    description: state.description,
    servingSize,
    servingSizeUnit: state.servingSizeUnit,
    householdServingFullText: state.householdServingFullText,
    foodNutrients,
  };
}
