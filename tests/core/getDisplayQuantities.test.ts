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

import { getDisplayQuantities } from "../../src/core/getDisplayQuantities";
import {
  TEST_SR_LEGACY_FOOD,
  TEST_BRANDED_FOOD,
  TEST_RECIPE,
} from "../testData";

describe("getDisplayQuantities", () => {
  it("SR Legacy", () => {
    expect(getDisplayQuantities(TEST_SR_LEGACY_FOOD)).toEqual([
      {
        description: "100 g",
        servings: 1,
      },
      {
        description: "1 cup (230 g)",
        servings: 2.3,
      },
      {
        description: "2 fruit without skin and seeds (304 g)",
        servings: 3.04,
      },
    ]);
  });

  it("Branded", () => {
    expect(getDisplayQuantities(TEST_BRANDED_FOOD)).toEqual([
      {
        description: "6 pieces (40 g)",
        servings: 40,
      },
      {
        description: "100 g",
        servings: 1,
      },
    ]);
  });

  it("SR Legacy", () => {
    expect(getDisplayQuantities(TEST_RECIPE)).toEqual([
      {
        description: "1 serving",
        servings: 1,
      },
    ]);
  });
});
