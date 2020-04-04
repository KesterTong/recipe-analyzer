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
import { createSelector } from "reselect";
import { getDisplayQuantities } from "../../core/getDisplayQuantities";
import { Food } from "../../core/Food";
import { nutrientsPerServingForFDCFood } from "../../core/FoodDataCentral";

export const selectQuantities = createSelector(
  (state: State) => state.food,
  getDisplayQuantities
);

export const selectNutrientsPerServing = createSelector(
  [
    (state: State, _: number[]) => state.food,
    (_: State, nutrientIds: number[]) => nutrientIds,
  ],
  (food: Food, nutrientIds: number[]) =>
    food.dataType == "Recipe"
      ? []
      : nutrientsPerServingForFDCFood(food, nutrientIds)
);
