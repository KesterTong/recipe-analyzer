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

import { Database } from "../src/document/Database";

/**
 * An implementation of a Database that stores recipes in a Google Doc.
 */
export const FakeDatabase: Database = {
  parseDocument: () => {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve([
            {
              totalNutrientValues: ["1000", "200"],
              ingredients: [
                {
                  unit: "cup",
                  amount: "1",
                  ingredient: {
                    description: "flour",
                    url:
                      "https://fdc.nal.usda.gov/fdc-app.html#/food-details/169761/nutrients",
                  },
                  nutrientValues: ["100", "20"],
                },
                {
                  unit: "g",
                  amount: "100",
                  ingredient: { description: "water", url: null },
                  nutrientValues: ["b", "c"],
                },
              ],
              nutrientNames: ["Protein", "Calories"],
              rangeId: "3e1qfk20lh8q",
              title: "Recipe 1",
              url: "#heading=h.y3h0qes0821d",
            },
            {
              totalNutrientValues: ["1000", "200"],
              ingredients: [
                {
                  unit: "cup",
                  amount: "1",
                  ingredient: { description: "flour", url: "#test" },
                  nutrientValues: ["100", "20"],
                },
                {
                  unit: "",
                  amount: "2",
                  ingredient: { description: "test2", url: "#bc" },
                  nutrientValues: ["b", "c"],
                },
              ],
              nutrientNames: ["Protein", "Calories"],
              rangeId: "abcdefg",
              title: "Recipe 2",
              url: "#heading=h.abcd1234",
            },
          ]),
        1000
      );
    });
  },
  addIngredient: (rangeId) => Promise.resolve(),
};
