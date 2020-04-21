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

import { addNutrients, scaleNutrients } from "../../src/core/Nutrients";

describe("scaleNutrients", () => {
  it("scaleNutrients", () => {
    expect(scaleNutrients({ "123": 10, "456": 20 }, 2)).toEqual({
      "123": 20,
      "456": 40,
    });
  });
});

describe("addNutrients", () => {
  it("addNutrients", () => {
    expect(
      addNutrients({ "123": 10, "456": 20 }, { "123": 10, "789": 20 })
    ).toEqual({ "123": 20, "456": 20, "789": 20 });
  });
});
