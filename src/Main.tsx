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
import { FoodInput } from "./FoodInput";
import { makeFdcWebUrl, NormalizedFood } from "./core";
import { Recipe } from "./document/Document";
import { fetchFdcFoods } from "./document/fetchFdcFoods";

export interface LoadingState {
  type: "Loading";
}

export interface ErrorState {
  type: "Error";
  message: string;
}

export interface ActiveState {
  type: "Active";
  recipes: Recipe[];
  selectedRecipeIndex: number;
  selectedIngredientIndex: number;
  fdcFoodsById: { [index: number]: NormalizedFood };
}
export type RootState = LoadingState | ErrorState | ActiveState;

export class Main extends React.Component<{database: Database}, RootState> {

  constructor(props: Readonly<{ database: Database; }>) {
    super(props);
    this.state =  {
      type: "Loading",
    };
    this.initialize();
  }

  async initialize() {
    try {
      const recipes = await this.props.database.parseDocument();
      const fdcFoodsById = await fetchFdcFoods(recipes);
      this.setState({
        type: "Active",
        recipes,
        fdcFoodsById,
        selectedRecipeIndex: 0, // TODO: handle empty recipe set.
        selectedIngredientIndex: 0, // TODO: handle empty ingredient list.
      });
    } catch (error) {
      this.setState({
        type: "Error",
        message: error.message,
      });
    }
  }

  selectRecipe(index: number) {
    if (this.state.type != 'Active') {
      return;
    }
    this.setState({
      type: 'Active',
      selectedRecipeIndex: index,
      selectedIngredientIndex: 0,
    });
  }

  async selectIngredient(index: number) {
    if (this.state.type != "Active") {
      return;
    }
    const selectedRecipeIndex = this.state.selectedRecipeIndex;
    const recipe = this.state.recipes[selectedRecipeIndex];
    if (index < recipe.ingredients.length) {
      this.setState({
        type: "Active",
        selectedIngredientIndex: index,
      })
    } else {
      const rangeId = recipe.rangeId;
      await this.props.database.addIngredient(rangeId);
      if (this.state.type != "Active") {
        return;
      }
      const selectedRecipeIndex = this.state.selectedRecipeIndex;
      this.setState({
        type: "Active",
        selectedIngredientIndex: this.state.recipes[selectedRecipeIndex].ingredients.length,
        recipes: this.state.recipes.map((recipe, index) => {
          if (index != selectedRecipeIndex) {
            return recipe;
          }
          return {
            ...recipe,
            ingredients: recipe.ingredients.concat([
              {
                amount: "",
                unit: "",
                ingredient: {
                  description: "",
                  url: null,
                },
                nutrientValues: [], // TODO: this is not correct.
              },
            ]),
          };
        }),
      })
    }
  }


  render() {
    const state = this.state;
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
      const selectedRecipe = state.recipes[state.selectedRecipeIndex];
      // Note this is undefined if "New Ingredient" is selected.
      let selectedIngredient =
        selectedRecipe.ingredients[state.selectedIngredientIndex];
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
      const suggestions = state.recipes
        .map((recipe) => ({
          description: recipe.title,
          url: recipe.url,
        }))
        .concat(
          Object.entries(state.fdcFoodsById).map((entry) => ({
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
                value={state.selectedRecipeIndex}
                onChange={(event) =>
                  this.selectRecipe(Number(event.target.value))
                }
                id="recipe"
              >
                {state.recipes.map((recipe, index) => (
                  <option value={index}>{recipe.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="block form-group">
            <label htmlFor="ingredient">Selected Ingredient</label>
            <div className="control-group">
              <select
                value={state.selectedIngredientIndex}
                onChange={(event) =>
                  this.selectIngredient(Number(event.target.value))
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
    }
  }
};
