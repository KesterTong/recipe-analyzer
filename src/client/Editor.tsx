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
import {
  Ingredient,
  Update,
  UpdateType,
  Nutrients,
  StatusOr,
  isOk,
  StatusCode,
} from "../core";
import { ListSelect } from "./ListSelect";

export interface StateProps {
  recipeTitles: string[];
  selectedRecipeIndex: number;
  ingredientDisplayStrings: string[];
  selectedIngredientIndex: number;
  selectedIngredient: Ingredient;
  selectedIngredientError: string | null;
  nutrients: { name: string; id: number }[];
  nutrientsPerIngredient: StatusOr<Nutrients>[];
  // TODO: make this a function of query.
  suggestions: { description: string; url: string }[];
}

export interface DispatchProps {
  selectRecipe(index: number): void;
  selectIngredient(index: number): void;
  updateDocument(update: Update): void;
}

function nutrientValue(nutrients: StatusOr<Nutrients>, id: number) {
  return isOk(nutrients) ? nutrients[id] : nutrients.code == StatusCode.LOADING ? "..." :  "!!";
}

export const Editor: React.FunctionComponent<StateProps & DispatchProps> = (
  props
) => (
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
      <table id="ingredients" className="nutrients-table" tabIndex={0}>
        <thead>
          <th>Ingredient</th>
          {props.nutrients.map(({ name }) => (
            <th>{name}</th>
          ))}
        </thead>
        <tbody>
          {props.ingredientDisplayStrings.map((displayString, index) => (
            <tr
              className={
                index == props.selectedIngredientIndex ? "selected-row" : ""
              }
              onClick={() => props.selectIngredient(index)}
            >
              <td>{displayString}</td>
              {props.nutrients.map(({ id }) => (
                <td>
                  {nutrientValue(props.nutrientsPerIngredient[index], id)}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td>Total</td>
            {props.nutrients.map((name) => (
              <td>??</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>

    <div className="block button-group">
      <button
        onClick={() =>
          props.updateDocument({
            type: UpdateType.ADD_INGREDIENT,
            recipeIndex: props.selectedRecipeIndex,
          })
        }
      >
        New
      </button>
      <button
        onClick={() =>
          props.updateDocument({
            type: UpdateType.DELETE_INGREDIENT,
            recipeIndex: props.selectedRecipeIndex,
            ingredientIndex: props.selectedIngredientIndex,
          })
        }
      >
        Delete
      </button>
      <button
        onClick={() =>
          props.updateDocument({
            type: UpdateType.SWAP_INGREDIENTS,
            recipeIndex: props.selectedRecipeIndex,
            firstIngredientIndex: props.selectedIngredientIndex - 1,
          })
        }
        disabled={props.selectedIngredientIndex == 0}
      >
        Move up
      </button>
      <button
        onClick={() =>
          props.updateDocument({
            type: UpdateType.SWAP_INGREDIENTS,
            recipeIndex: props.selectedRecipeIndex,
            firstIngredientIndex: props.selectedIngredientIndex,
          })
        }
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
            props.updateDocument({
              type: UpdateType.UPDATE_INGREDIENT,
              recipeIndex: props.selectedRecipeIndex,
              ingredientIndex: props.selectedIngredientIndex,
              newAmount: event.target.value,
            })
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
            props.updateDocument({
              type: UpdateType.UPDATE_INGREDIENT,
              recipeIndex: props.selectedRecipeIndex,
              ingredientIndex: props.selectedIngredientIndex,
              newUnit: event.target.value,
            })
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
        onChange={(value) =>
          props.updateDocument({
            type: UpdateType.UPDATE_INGREDIENT,
            recipeIndex: props.selectedRecipeIndex,
            ingredientIndex: props.selectedIngredientIndex,
            newFood: value,
          })
        }
      />
      <div className="error">{props.selectedIngredientError}</div>
    </div>
  </React.Fragment>
);
