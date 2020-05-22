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
import { Recipe, updateRecipes, Ingredient } from "../../src/core";
import { Config } from "../../src/config/config";

let recipes: Recipe[] = [
  {
    ingredients: [
      {
        unit: "cup",
        amount: "1",
        ingredient: {
          description: "flour",
          url:
            "https://fdc.nal.usda.gov/fdc-app.html#/food-details/169761/nutrients",
        },
      },
      {
        unit: "g",
        amount: "100",
        ingredient: { description: "water", url: null },
      },
    ],
    title: "Recipe 1",
    url: "#heading=h.y3h0qes0821d",
  },
  {
    ingredients: [
      {
        unit: "cup",
        amount: "1",
        ingredient: {
          description: "flour",
          url:
            "https://fdc.nal.usda.gov/fdc-app.html#/food-details/1234/nutrients",
        },
      },
      {
        unit: "",
        amount: "2",
        ingredient: { description: "test2", url: "#abcd" },
      },
    ],
    title: "Recipe 2",
    url: "#heading=h.abcd1234",
  },
];

const FoodLink: React.FunctionComponent<{
  description: string;
  url: string | null;
}> = (props) =>
  props.url === null ? (
    <React.Fragment>{props.description}</React.Fragment>
  ) : (
    <a href={props.url}>{props.description}</a>
  );

const IngredientsTableRow: React.FunctionComponent<{
  ingredient: Ingredient;
}> = (props) => (
  <tr>
    <td>{props.ingredient.amount}</td>
    <td>{props.ingredient.unit}</td>
    <td>
      <FoodLink {...props.ingredient.ingredient} />
    </td>
  </tr>
);

const RecipeView: React.FunctionComponent<{ recipe: Recipe }> = (props) => (
  <React.Fragment>
    <h1 id={props.recipe.url.substr(1)}>{props.recipe.title}</h1>
    <table>
      <tbody>
        {props.recipe.ingredients.map((ingredient) => (
          <IngredientsTableRow ingredient={ingredient} />
        ))}
      </tbody>
    </table>
  </React.Fragment>
);

const Recipes: React.FunctionComponent<{ recipes: Recipe[] }> = (props) => (
  <React.Fragment>
    {props.recipes.map((recipe) => (
      <RecipeView recipe={recipe} />
    ))}
  </React.Fragment>
);

function render() {
  ReactDOM.render(
    <div className="document-container">
      <div className="document">
        <Recipes recipes={recipes} />
      </div>
    </div>,
    document.getElementById("root")
  );
}

render();

async function parseDocument(): Promise<Recipe[]> {
  return recipes;
}

async function updateDocument(update: Update): Promise<void> {
  recipes = updateRecipes(recipes, update);
  render();
}

async function selectRecipe(recipeIndex: number): Promise<void> {
}

async function getConfig(): Promise<Config> {
  const response = await fetch("config.json");
  return response.json();
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
    return (...args) =>
      fn(...args)
        .then(this.successHandler)
        .catch(this.failureHandler);
  }

  parseDocument = this.wrapFn(parseDocument);
  updateDocument = this.wrapFn(updateDocument);
  getConfig = this.wrapFn(getConfig);
  selectRecipe = this.wrapFn(selectRecipe);
}

const google: any = {};
google.script = {};
google.script.run = new GoogleScriptRun();

(frames[0].window as any).google = google;
