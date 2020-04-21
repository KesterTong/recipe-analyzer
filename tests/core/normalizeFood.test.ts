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

import {
  nutrientsPerServingForFood,
  servingEquivalentQuantities,
} from "../../src/core/normalizeFood";
import {
  TEST_SR_LEGACY_FOOD,
  TEST_BRANDED_FOOD,
  TEST_RECIPE,
} from "../testData";
import { Food } from "../../src/core/Food";

describe("nutrientsPerServingForFood", () => {
  const foodCache: { [index: string]: Food } = {
    "userData/id.abc123": TEST_BRANDED_FOOD,
  };

  it("SR Legacy Food", () => {
    const result = nutrientsPerServingForFood(TEST_SR_LEGACY_FOOD, foodCache);
    expect(result).toEqual({ "1003": 10, "1008": 123 });
  });

  it("Branded Food", () => {
    const result = nutrientsPerServingForFood(TEST_BRANDED_FOOD, foodCache);
    expect(result).toEqual({ "1003": 5, "1008": 425 });
  });

  it("Recipe", () => {
    const result = nutrientsPerServingForFood(TEST_RECIPE, foodCache);
    expect(result).toEqual({ "1003": 2.5, "1008": 212.5 });
  });
});

describe("servingEquivalentQuantities", () => {
  it("SR Legacy Food", () => {
    const result = servingEquivalentQuantities(TEST_SR_LEGACY_FOOD);
    expect(result).toEqual({
      g: 100.0,
      ml: 102.86521739130434,
      "fruit without skin and seed": 0.6578947368421053,
    });
  });

  it("Branded Food", () => {
    const result = servingEquivalentQuantities(TEST_BRANDED_FOOD);
    expect(result).toEqual({ g: 100.0, piece: 15.0 });
  });

  it("Recipe", () => {
    const result = servingEquivalentQuantities(TEST_RECIPE);
    expect(result).toEqual({ serving: 1.0 });
  });
});
