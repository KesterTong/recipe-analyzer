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
import { Database } from "./document/Database";
import { Dropdown } from "./Dropdown";
import { Status } from "./core";

interface MainProps {
  database: Database;
  recipeTitles: string[] | null;
  ingredientStrings: string[] | null;
  selectedRecipeIndex: number;
  selectedIngredientIndex: number;
  errors: Status[];
  selectRecipe(index: number): void;
  selectIngredient(index: number): void;
}

export const Main: React.FunctionComponent<MainProps> = (props) => {
  return (
    <React.Fragment>
      <Dropdown
        id="recipe"
        label="Selected Recipe"
        options={
          props.recipeTitles
            ? props.recipeTitles.map((title, index) => ({
                value: index,
                label: title,
              }))
            : [{ value: 0, label: "Loading..." }]
        }
        selected={props.selectedRecipeIndex}
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
        options={
          props.ingredientStrings
            ? props.ingredientStrings.map((title, index) => ({
                value: index,
                label: title,
              }))
            : [{ value: 0, label: "" }]
        }
        selected={props.selectedIngredientIndex}
        onChange={(event) => props.selectIngredient(Number(event.target.value))}
      />

      <div className="block form-group">
        <label htmlFor="errors">Errors</label>
        <select id="errors" multiple>
          {props.errors.map((error) => (
            <option className="error">{error.message}</option>
          ))}
        </select>
      </div>
    </React.Fragment>
  );
};
