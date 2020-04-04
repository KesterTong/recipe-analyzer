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
import { memoize } from "lodash";
import { createSelectorCreator } from "reselect";
import { Ingredient } from "./types";
import {
  nutrientsForQuantity,
  getIngredientUnits,
  servingEquivalentQuantities,
} from "../../core";

const customSelectorCreator = createSelectorCreator(
  <(...args: any) => any>memoize
);

export const selectQueryResult = customSelectorCreator(
  (ingredient: Ingredient | null) => ingredient,
  (ingredient: Ingredient | null) => {
    if (ingredient == null || ingredient.deselected) {
      return null;
    }
    return {
      foodId: ingredient.foodId,
      description: ingredient.food?.description || "Loading...",
    };
  }
);

export const selectIngredientUnits = customSelectorCreator(
  (ingredient: Ingredient | null) => ingredient,
  (ingredient: Ingredient | null) =>
    ingredient && ingredient.food
      ? getIngredientUnits(servingEquivalentQuantities(ingredient.food))
      : [""]
);

export type LOADING = "LOADING";

export const selectNutrientsForIngredient = customSelectorCreator(
  (ingredient: Ingredient | null) => ingredient,
  (ingredient: Ingredient | null) => {
    if (
      ingredient == null ||
      ingredient.food == null ||
      ingredient.nutrientsPerServing == null
    ) {
      return "LOADING";
    }
    return nutrientsForQuantity(
      ingredient.amount,
      ingredient.unit,
      servingEquivalentQuantities(ingredient.food),
      ingredient.nutrientsPerServing
    );
  }
);
