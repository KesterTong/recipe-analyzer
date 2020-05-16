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
import { FoodInput } from "./FoodInput";
import { makeFdcWebUrl, NormalizedFood } from "./core";
import { Recipe } from "./document/Document";

interface Props {
  recipes: Recipe[];
  selectedRecipeIndex: number;
  selectedIngredientIndex: number;
  fdcFoodsById: { [index: number]: NormalizedFood };
  selectRecipe(index: number): void;
  selectIngredient(index: number): void;
}

export const Editor: React.FunctionComponent<Props> = (props) => {
  const selectedRecipe = props.recipes[props.selectedRecipeIndex];
  // Note this is undefined if "New Ingredient" is selected.
  let selectedIngredient =
    selectedRecipe.ingredients[props.selectedIngredientIndex];
  if (selectedIngredient === undefined) {
    selectedIngredient = {
      amount: "",
      unit: "",
      ingredient: {
        description: "",
        url: null,
      },
      nutrientValues: [], // TODO: this is not correct.
    };
  }
  const suggestions = props.recipes
    .map((recipe) => ({
      description: recipe.title,
      url: recipe.url,
    }))
    .concat(
      Object.entries(props.fdcFoodsById).map((entry) => ({
        url: makeFdcWebUrl(Number(entry[0])),
        description: entry[1].description,
      }))
    );
  return (
    <React.Fragment>
      <div className="block form-group">
        <label htmlFor="recipe">Selected Recipe</label>
        <div className="control-group">
          <select
            value={props.selectedRecipeIndex}
            onChange={(event) => props.selectRecipe(Number(event.target.value))}
            id="recipe"
          >
            {props.recipes.map((recipe, index) => (
              <option value={index}>{recipe.title}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="block form-group">
        <label htmlFor="ingredient">Selected Ingredient</label>
        <div className="control-group">
          <select
            value={props.selectedIngredientIndex}
            onChange={(event) =>
              props.selectIngredient(Number(event.target.value))
            }
            id="ingredient"
          >
            {selectedRecipe.ingredients.map((ingredient, index) => (
              <option value={index}>
                {ingredient.amount +
                  " " +
                  ingredient.unit +
                  " " +
                  ingredient.ingredient.description}
              </option>
            ))}
            <option value={selectedRecipe.ingredients.length}>
              New Ingredient
            </option>
          </select>
          <button className="icon-button">
            <i className="material-icons">delete</i>
          </button>
          <button className="icon-button">
            <i className="material-icons">arrow_upward</i>
          </button>
          <button className="icon-button">
            <i className="material-icons">arrow_downward</i>
          </button>
        </div>
      </div>
      <div className="block form-group">
        <label htmlFor="ingredient-amount">Amount</label>
        <div className="control-group">
          <input
            type="text"
            id="ingredient-amount"
            value={selectedIngredient.amount}
          ></input>
        </div>
      </div>
      <div className="block form-group">
        <label htmlFor="ingredient-unit">Unit</label>
        <div className="control-group">
          <input
            type="text"
            id="ingredient-unit"
            value={selectedIngredient.unit}
          ></input>
        </div>
      </div>
      <div className="block form-group">
        <label htmlFor="ingredient-food">Food</label>
        <FoodInput id="ingredient-food" suggestions={suggestions} />
      </div>
    </React.Fragment>
  );
};
