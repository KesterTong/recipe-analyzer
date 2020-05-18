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
import ReactDOM = require("react-dom");
import React = require("react");

import { Update } from "../../src/core/Update";
import { Recipe, updateRecipes } from "../../src/core";


let recipes: Recipe[] = [
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

async function parseDocument(): Promise<Recipe[]> {
  return recipes;
}

async function updateDocument(update: Update): Promise<void> {
  recipes = updateRecipes(recipes, update);
  console.log(JSON.stringify(recipes, undefined, 2));
}

class GoogleScriptRun {
  private successHandler: any;
  private failureHandler: any;

  constructor(succesHandler?: any, failureHandler?: any) {
    this.successHandler = succesHandler;
    this.failureHandler = failureHandler;
  }

  withSuccessHandler(succesHandler: any) {
    return new GoogleScriptRun(succesHandler, this.failureHandler);
  }

  withFailureHandler(failureHandler: any) {
    return new GoogleScriptRun(this.successHandler, failureHandler);
  }

  private wrapFn(fn: (...args: any) => Promise<any>): (...args: any) => void {
    return (...args) => fn(...args).then(this.successHandler).catch(this.failureHandler);
  }

  parseDocument = this.wrapFn(parseDocument);
  updateDocument = this.wrapFn(updateDocument);
}

const google: any = {};
google.script = {};
google.script.run = new GoogleScriptRun();

(frames[0].window as any).google = google;