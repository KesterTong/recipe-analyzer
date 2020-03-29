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
import { createSelector } from 'reselect';
import { Food } from "../../../core/Food";

export const selectQuantities = createSelector(
  (state: State) => state.food,
  (food: Food) => {
    switch (food.dataType) {
      case "Branded":
        return [
          {
            description:
              food.householdServingFullText! +
              " (" +
              food.servingSize +
              " " +
              food.servingSizeUnit +
              " )",
            servings: food.servingSize,
          },
          { description: "100 " + food.servingSizeUnit, servings: 1 },
        ];
      case "Recipe":
        return [{ description: "1 serving", servings: 1 }];
      case "SR Legacy":
        let quantities = [{ description: "100 g", servings: 1 }];
        food.foodPortions.forEach((portion) => {
          let description =
            portion.amount.toString() +
            " " +
            portion.modifier +
            " (" +
            portion.gramWeight +
            " g)";
          quantities.push({ description, servings: portion.gramWeight / 100 });
        });
        return quantities;
    }
  });
