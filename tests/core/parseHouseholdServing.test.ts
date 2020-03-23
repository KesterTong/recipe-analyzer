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

import { parseHouseholdServing } from "../../core/parseHouseholdServing";

describe("parseHouseholdServing", () => {
  it("1 cup (240 ml)", () => {
    expect(parseHouseholdServing("1 cup (240 ml)")).toEqual({
      servingSize: 240.0,
      servingSizeUnit: "ml",
      householdServingFullText: "1 cup",
    });
  });
  it("240 ml", () => {
    expect(parseHouseholdServing("240 ml")).toEqual({
      servingSize: 240.0,
      servingSizeUnit: "ml",
      householdServingFullText: undefined,
    });
  });
  it("1 cup", () => {
    expect(parseHouseholdServing("1 cup")).toEqual(null);
  });
});
