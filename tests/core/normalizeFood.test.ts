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

import { normalizeFood } from "../../core/normalizeFood";
import {
  TEST_SR_LEGACY_FOOD,
  TEST_SR_LEGACY_FOOD_NORMALIZED,
  TEST_BRANDED_FOOD,
  TEST_BRANDED_FOOD_NORMALIZED,
  TEST_RECIPE,
  TEST_RECIPE_NORMALIZED,
} from "../testData";

import { Food } from "../../core/Food";

describe("normalizeFood", () => {
  function getFood(foodId: string): Promise<Food | null> {
    return Promise.resolve(TEST_BRANDED_FOOD);
  }

  it("SR Legacy", async () => {
    const result = await normalizeFood(TEST_SR_LEGACY_FOOD, getFood, [
      1008,
      1003,
    ]);
    expect(result).toEqual(TEST_SR_LEGACY_FOOD_NORMALIZED);
  });

  it("Branded", async () => {
    const result = await normalizeFood(TEST_BRANDED_FOOD, getFood, [
      1008,
      1003,
    ]);
    expect(result).toEqual(TEST_BRANDED_FOOD_NORMALIZED);
  });

  it("Recipe", async () => {
    const result = await normalizeFood(TEST_RECIPE, getFood, [1008, 1003]);
    expect(result).toEqual(TEST_RECIPE_NORMALIZED);
  });
});
