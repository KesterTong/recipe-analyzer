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

import { normalizeFDCFood, initializeQuantityData } from "../../src/core";
import { TEST_SR_LEGACY_FOOD, TEST_BRANDED_FOOD } from "../testData";
import { defaultConfig } from "../../src/client/config";

describe("normalizeFDCFood", () => {
  const conversionData = initializeQuantityData(
    defaultConfig.massUnits,
    defaultConfig.volumeUnits
  );

  it("SR Legacy Food", () => {
    const result = normalizeFDCFood(TEST_SR_LEGACY_FOOD, conversionData);
    expect(result).toEqual({
      description: "Bananas",
      nutrientsPerServing: { "1003": 10, "1008": 123 },
      gramsPerServing: 100,
      mlPerServing: 102.86521739130434,
      otherServingEquivalents: [
        {
          amount: 0.6578947368421053,
          unit: "fruit without skin and seed",
        },
      ],
    });
  });

  it("Branded Food", () => {
    const result = normalizeFDCFood(TEST_BRANDED_FOOD, conversionData);
    expect(result).toEqual({
      description: "Plantain Chips",
      nutrientsPerServing: { "1003": 5, "1008": 425 },
      gramsPerServing: 100,
      mlPerServing: null,
      otherServingEquivalents: [
        {
          amount: 15.0,
          unit: "piece",
        },
      ],
    });
  });
});
