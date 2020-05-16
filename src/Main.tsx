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
import { Recipe, Ingredient } from "./document/Document";
import { fetchFdcFoods } from "./document/fetchFdcFoods";
import { Editor } from "./Editor";

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

export class Main extends React.Component<{ database: Database }, RootState> {
  constructor(props: Readonly<{ database: Database }>) {
    super(props);
    this.state = {
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
    if (this.state.type != "Active") {
      return;
    }
    this.setState({
      type: "Active",
      selectedRecipeIndex: index,
      selectedIngredientIndex: 0,
    });
  }

  updateSelectedRecipe(updateFn: (recipe: Recipe) => Recipe) {
    if (this.state.type != "Active") {
      return;
    }
    const selectedRecipeIndex = this.state.selectedRecipeIndex;
    this.setState({
      type: "Active",
      recipes: this.state.recipes.map((recipe, index) =>
        index == selectedRecipeIndex ? updateFn(recipe) : recipe
      ),
    });
  }

  addIngredient(recipeIndex: number) {
    if (this.state.type != "Active") {
      return;
    }
    this.updateSelectedRecipe((recipe) => {
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
    });
    this.setState({
      type: "Active",
      selectedRecipeIndex: recipeIndex,
      selectedIngredientIndex:
        this.state.recipes[recipeIndex].ingredients.length - 1,
    });
  }

  updateSelectedIngredient(updateFn: (ingredient: Ingredient) => Ingredient) {
    if (this.state.type != "Active") {
      return;
    }
    const selectedIngredientIndex = this.state.selectedIngredientIndex;
    this.updateSelectedRecipe((recipe) => ({
      ...recipe,
      ingredients: recipe.ingredients.map((ingredient, index) =>
        index == selectedIngredientIndex ? updateFn(ingredient) : ingredient
      ),
    }));
  }

  updateAmount(amount: string) {
    this.updateSelectedIngredient((ingredient) => ({
      ...ingredient,
      amount,
    }));
  }

  updateUnit(unit: string) {
    this.updateSelectedIngredient((ingredient) => ({
      ...ingredient,
      unit,
    }));
  }

  updateFood(food: { description: string; url: string | null }) {
    this.updateSelectedIngredient((ingredient) => ({
      ...ingredient,
      ingredient: food,
    }));
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
      });
    } else {
      const rangeId = recipe.rangeId;
      await this.props.database.addIngredient(rangeId);
      this.addIngredient(selectedRecipeIndex);
    }
  }

  render() {
    switch (this.state.type) {
      case "Loading":
        return (
          <React.Fragment>
            <div>Loading...</div>
          </React.Fragment>
        );
      case "Error":
        return (
          <React.Fragment>
            <div className="error">{this.state.message}</div>
          </React.Fragment>
        );
      case "Active":
        return (
          <Editor
            {...this.state}
            selectRecipe={(index) => this.selectRecipe(index)}
            selectIngredient={(index) => this.selectIngredient(index)}
            updateAmount={(amount) => this.updateAmount(amount)}
            updateUnit={(unit) => this.updateUnit(unit)}
            updateFood={(food) => this.updateFood(food)}
          />
        );
    }
  }
}
