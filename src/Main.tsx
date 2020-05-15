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
import * as React from "react";
import { Dropdown } from "./Dropdown";
import { RootState } from "./store";
import { Database } from "./document/Database";

interface MainProps {
  database: Database;
  state: RootState;
  selectRecipe(index: number): void;
  selectIngredient(index: number): void;
}

export const Main: React.FunctionComponent<MainProps> = (props) => {
  const state = props.state;
  if (state.type == "Loading") {
    return (
      <React.Fragment>
        <div>Loading...</div>
      </React.Fragment>
    );
  } else if (state.type == "Error") {
    return (
      <React.Fragment>
        <div className="error">{state.message}</div>
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <Dropdown
          id="recipe"
          label="Selected Recipe"
          options={state.recipes.map((recipe, index) => ({
            value: index,
            label: recipe.title,
          }))}
          selected={state.selectedRecipeIndex}
          onChange={(event) => props.selectRecipe(Number(event.target.value))}
        />
        <div className="block form-group button-group">
          <button>Delete</button>
          <button>Insert Above</button>
          <button>Insert Below</button>
        </div>
        <Dropdown
          id="ingredient"
          label="Selected Ingredient"
          options={state.recipes[
            state.selectedRecipeIndex
          ].ingredients.map((ingredient, index) => ({
            value: index,
            label:
              ingredient.amount +
              " " +
              ingredient.unit +
              " " +
              ingredient.ingredient.description,
          }))}
          selected={state.selectedIngredientIndex}
          onChange={(event) =>
            props.selectIngredient(Number(event.target.value))
          }
        />
      </React.Fragment>
    );
  }
};
