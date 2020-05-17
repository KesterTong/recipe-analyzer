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
import { NormalizedFood } from "./core";
import { Recipe } from "./document/Document";

interface Props {
  // New Props
  recipeTitles: string[];
  selectedRecipeIndex: number;
  ingredientDisplayStrings: string[];
  selectedIngredientIndex: number;
  // TODO: make this a function of query.
  suggestions: { description: string; url: string }[];

  // Legacy props
  selectedRecipe: Recipe;
  fdcFoodsById: { [index: number]: NormalizedFood };

  selectRecipe(index: number): void;
  selectIngredient(index: number): void;
  updateAmount(amount: string): void;
  updateUnit(unit: string): void;
  updateFood(food: { description: string; url: string | null }): void;
  moveUpward(): void;
  moveDownward(): void;
  deleteIngredient(): void;
}

export const Editor: React.FunctionComponent<Props> = (props) => {
  // Note this is undefined if "New Ingredient" is selected.
  let selectedIngredient =
    props.selectedRecipe.ingredients[props.selectedIngredientIndex];
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
            {props.recipeTitles.map((title, index) => (
              <option value={index}>{title}</option>
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
            {props.ingredientDisplayStrings.map((displayString, index) => (
              <option value={index}>{displayString}</option>
            ))}
            <option value={props.selectedRecipe.ingredients.length}>
              New Ingredient
            </option>
          </select>
          <button className="icon-button" onClick={props.deleteIngredient}>
            <i className="material-icons">delete</i>
          </button>
          <button
            className="icon-button"
            onClick={props.moveUpward}
            disabled={props.selectedIngredientIndex == 0}
          >
            <i className="material-icons">arrow_upward</i>
          </button>
          <button
            className="icon-button"
            onClick={props.moveDownward}
            disabled={
              props.selectedIngredientIndex ==
              props.selectedRecipe.ingredients.length - 1
            }
          >
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
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              props.updateAmount(event.target.value)
            }
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
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              props.updateUnit(event.target.value)
            }
          ></input>
        </div>
      </div>
      <div className="block form-group">
        <label htmlFor="ingredient-food">Food</label>
        <FoodInput
          id="ingredient-food"
          value={selectedIngredient.ingredient}
          suggestions={props.suggestions}
          onChange={props.updateFood}
        />
      </div>
    </React.Fragment>
  );
};
