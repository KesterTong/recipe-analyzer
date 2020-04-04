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

/**
 * Get a list of quantities to display when viewing an ingredient.
 *
 * This is the set of quantities that a user might want to view the
 * nutritional info for, e.g. 100 g, 1 container, 1 cup.
 */
export function getDisplayQuantities(food: Food) {
  switch (food.dataType) {
    case "Branded":
      const hhs = food.householdServingFullText!;
      const s = food.servingSize.toString();
      const su = food.servingSizeUnit;
      return [
        {
          description: `${hhs} (${s} ${su})`,
          servings: food.servingSize,
        },
        {
          description: `100 ${food.servingSizeUnit}`,
          servings: 1,
        },
      ];
    case "Recipe":
      return [{ description: "1 serving", servings: 1 }];
    case "SR Legacy":
      let quantities = [{ description: "100 g", servings: 1 }];
      food.foodPortions.forEach((portion) => {
        const a = portion.amount.toString();
        const m = portion.modifier;
        const gw = portion.gramWeight;
        quantities.push({
          description: `${a} ${m} (${gw} g)`,
          servings: portion.gramWeight / 100,
        });
      });
      return quantities;
  }
}
