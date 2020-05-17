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
import { Ingredient } from "./document/Document";
import { ListSelect } from "./ListSelect";

interface Props {
  recipeTitles: string[];
  selectedRecipeIndex: number;
  ingredientDisplayStrings: string[];
  selectedIngredientIndex: number;
  selectedIngredient: Ingredient;
  // TODO: make this a function of query.
  suggestions: { description: string; url: string }[];

  selectRecipe(index: number): void;
  selectIngredient(index: number): void;
  updateAmount(amount: string): void;
  updateUnit(unit: string): void;
  updateFood(food: { description: string; url: string | null }): void;
  moveUpward(): void;
  moveDownward(): void;
  newIngredient(): void;
  deleteIngredient(): void;
}

export const Editor: React.FunctionComponent<Props> = (props) => (
  <React.Fragment>
    <div className="block form-group">
      <label htmlFor="recipe">Selected Recipe</label>
      <div className="control-group">
        <ListSelect
          labels={props.recipeTitles}
          value={props.selectedRecipeIndex}
          id="ingredient"
          onChange={props.selectRecipe}
        />
      </div>
    </div>
    <div className="block form-group">
      <label htmlFor="ingredient">Selected Ingredient</label>
      <div className="control-group">
        <ListSelect
          labels={props.ingredientDisplayStrings}
          value={props.selectedIngredientIndex}
          id="ingredient"
          onChange={props.selectIngredient}
        />
      </div>
    </div>

    <div className="block button-group">
      <button onClick={props.newIngredient}>New</button>
      <button onClick={props.deleteIngredient}>Delete</button>
      <button
        onClick={props.moveUpward}
        disabled={props.selectedIngredientIndex == 0}
      >
        Move up
      </button>
      <button
        onClick={props.moveDownward}
        disabled={
          props.selectedIngredientIndex ==
          props.ingredientDisplayStrings.length - 1
        }
      >
        Move down
      </button>
    </div>
    <div className="block form-group">
      <label htmlFor="ingredient-amount">Amount</label>
      <div className="control-group">
        <input
          type="text"
          id="ingredient-amount"
          value={props.selectedIngredient.amount}
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
          value={props.selectedIngredient.unit}
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
        value={props.selectedIngredient.ingredient}
        suggestions={props.suggestions}
        onChange={props.updateFood}
      />
    </div>
  </React.Fragment>
);
