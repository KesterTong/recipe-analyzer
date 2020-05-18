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

import { Database, Update } from "../apps_script/Database";
import { Recipe, updateRecipes } from "../src/core";

const INITIAL_RECIPES: Recipe[] = [
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
    title: "Recipe 2",
    url: "#heading=h.abcd1234",
  },
];

function wait(timeout: number): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(), timeout)
  );
}

const UPDATE_LATENCY_MS = 1000;

class FakeDatabase implements Database {
  recipes: Recipe[];

  constructor(recipes: Recipe[]) {
    this.recipes = recipes;
  }

  parseDocument = async (): Promise<Recipe[]> => {
    await wait(UPDATE_LATENCY_MS);
    return this.recipes;
  }

  updateDocument = async (update: Update): Promise<void> => {
    await wait(UPDATE_LATENCY_MS);
    this.recipes = updateRecipes(this.recipes, update);
    console.log(this.recipes);
  }
}

export const database = new FakeDatabase(INITIAL_RECIPES);