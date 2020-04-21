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
import { createSelector } from "reselect";
import { Food, getDisplayQuantities } from "../../core";
import { nutrientsPerServingForFDCFood } from "../../core/FoodDataCentral";
import { State } from "./types";

export const selectQuantities = createSelector(
  (state: State) => state.food,
  getDisplayQuantities
);

export const selectNutrientsPerServing = createSelector(
  [
    (state: State, _: string[]) => state.food,
    (_: State, nutrientIds: string[]) => nutrientIds,
  ],
  // TODO: Compute nutrientsPerServing in an action and do so for recipes too.
  (food: Food, nutrientIds: string[]) => {
    const nutrients =
      food.dataType == "Recipe" ? {} : nutrientsPerServingForFDCFood(food);
    return nutrientIds.map((nutrientId) => nutrients[nutrientId]);
  }
);
