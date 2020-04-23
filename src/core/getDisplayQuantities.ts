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
import { Food } from "./Food";
import { Quantity } from "./Quantity";
import { parseQuantity } from "./parseQuantity";

/**
 * Get a list of quantities to display when viewing an ingredient.
 *
 * This is the set of quantities that a user might want to view the
 * nutritional info for, e.g. 100 g, 1 container, 1 cup.
 */
export function getDisplayQuantities(food: Food): Quantity[] {
  const result: Quantity[] = [];
  switch (food.dataType) {
    case "Branded":
      result.push({
        amount: 100,
        unit: food.servingSizeUnit,
      });
      if (food.householdServingFullText) {
        const householdServing = parseQuantity(food.householdServingFullText);
        if (householdServing) {
          result.push(householdServing);
        }
      }
      break;
    case "Recipe":
      result.push({ amount: 1, unit: "serving" });
      break;
    case "SR Legacy":
      result.push({ amount: 100, unit: "g" });
      result.push(
        ...food.foodPortions.map((portion) => ({
          amount: portion.amount,
          unit: portion.modifier,
        }))
      );
      break;
  }
  return result;
}
