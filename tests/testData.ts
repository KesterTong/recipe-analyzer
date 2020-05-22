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

import { FDCFood } from "../src/food_data_central/FoodDataCentral";

export const TEST_SR_LEGACY_FOOD: FDCFood = {
  description: "Bananas",
  dataType: "SR Legacy",
  foodNutrients: [
    {
      nutrient: { id: 1008 },
      amount: 123.0,
    },
    {
      nutrient: { id: 1003 },
      amount: 10.0,
    },
  ],
  foodPortions: [
    {
      modifier: "cup",
      gramWeight: 230.0,
      amount: 1.0,
    },
    {
      modifier: "fruit without skin and seeds",
      gramWeight: 304.0,
      amount: 2.0,
    },
  ],
};

export const TEST_BRANDED_FOOD: FDCFood = {
  description: "Plantain Chips",
  dataType: "Branded",
  foodNutrients: [
    {
      nutrient: { id: 1003 },
      amount: 5.0,
    },
    {
      nutrient: { id: 1008 },
      amount: 425.0,
    },
  ],
  servingSize: 40,
  servingSizeUnit: "g",
  householdServingFullText: "6 pieces",
};

// export const TEST_RECIPE: Food = {
//   dataType: "Recipe",
//   description: "My Recipe",
//   ingredientsList: [
//     {
//       quantity: {
//         amount: 7.5,
//         unit: "piece",
//       },
//       foodId: "userData/id.abc123",
//     },
//   ],
// };
