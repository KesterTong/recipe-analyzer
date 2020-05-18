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
import { doc } from "prettier";

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

const IngredientsTableHeader: React.FunctionComponent<{
  nutrientNames: string[];
}> = (props) => (
  <thead>
    <th></th>
    <th></th>
    <th></th>
    {props.nutrientNames.map((name) => (
      <th>{name}</th>
    ))}
  </thead>
);

const IngredientsTableRow: React.FunctionComponent<{
  ingredient: Ingredient;
}> = (props) => (
  <tr>
    <td>{props.ingredient.amount}</td>
    <td>{props.ingredient.unit}</td>
    <td>{props.ingredient.ingredient.description}</td>
    {props.ingredient.nutrientValues.map((value) => (
      <td>{value}</td>
    ))}
  </tr>
);

const IngredientsTableTotalRow: React.FunctionComponent<{
  totalNutrientValues: string[];
}> = (props) => (
  <tr>
    <td></td>
    <td></td>
    <td>Total</td>
    {props.totalNutrientValues.map((value) => (
      <td>{value}</td>
    ))}
  </tr>
);

const RecipeView: React.FunctionComponent<{ recipe: Recipe }> = (props) => (
  <React.Fragment>
    <h1 id={props.recipe.url.substr(1)}>{props.recipe.title}</h1>
    <table>
      <IngredientsTableHeader nutrientNames={props.recipe.nutrientNames} />
      <tbody>
        {props.recipe.ingredients.map((ingredient) => (
          <IngredientsTableRow ingredient={ingredient} />
        ))}
        <IngredientsTableTotalRow
          totalValues={props.recipe.totalNutrientValues}
        />
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
    <Recipes recipes={recipes} />,
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
}

const google: any = {};
google.script = {};
google.script.run = new GoogleScriptRun();

(frames[0].window as any).google = google;
