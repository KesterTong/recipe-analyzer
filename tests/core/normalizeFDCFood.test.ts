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

import { initializeQuantityData, ConversionData } from "../../src/core";
import { normalizeFDCFood } from "../../src/food_data_central/normalizeFdcFood";
import { TEST_SR_LEGACY_FOOD, TEST_BRANDED_FOOD } from "../testData";

describe("normalizeFDCFood", () => {
  const conversionData: ConversionData = {
    gramEquivalentByUnit: { g: 1 },
    mlEquivalentByUnit: { ml: 1, cup: 236.59 },
  };

  it("SR Legacy Food", () => {
    const result = normalizeFDCFood(TEST_SR_LEGACY_FOOD, conversionData);
    expect(result).toEqual({
      description: "Bananas",
      nutrientsPerServing: { "1003": 10, "1008": 123 },
      servingEquivalents: [
        {
          amount: 100,
          unit: "g",
        },
        {
          amount: 102.86521739130434,
          unit: "ml",
        },
        {
          amount: 0.6578947368421053,
          unit: "fruit without skin and seeds",
        },
      ],
    });
  });

  it("Branded Food", () => {
    const result = normalizeFDCFood(TEST_BRANDED_FOOD, conversionData);
    expect(result).toEqual({
      description: "Plantain Chips",
      nutrientsPerServing: { "1003": 5, "1008": 425 },
      servingEquivalents: [
        {
          amount: 100,
          unit: "g",
        },
        {
          amount: 15,
          unit: "pieces",
        },
      ],
    });
  });
});
