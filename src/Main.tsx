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
import { Database, Update, UpdateType } from "../apps_script/Database";
import { FoodInput } from "./FoodInput";
import { makeFdcWebUrl, NormalizedFood } from "./core";
import { Recipe, Ingredient } from "./document/Document";
import { fetchFdcFoods } from "./document/fetchFdcFoods";
import { Editor } from "./Editor";
import { debounce } from "./debounce";

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
  private updateServerDocument: (update: Update) => Promise<void>;

  constructor(props: Readonly<{ database: Database }>) {
    super(props);
    this.state = {
      type: "Loading",
    };
    this.updateServerDocument = debounce(props.database.updateDocument);
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

  updateDocument(update: Update) {
    const state = this.state;
    if (state.type != "Active") {
      return;
    }

    // We update the document on the server side asynchronously.
    this.updateServerDocument(update);

    const recipe = state.recipes[update.recipeIndex];
    let newSelectedIngredientIndex;
    let newRecipe: Recipe;
    switch (update.type) {
      case UpdateType.ADD_INGREDIENT:
        const newIngredient = {
          amount: "",
          unit: "",
          ingredient: {
            description: "",
            url: null,
          },
          nutrientValues: [], // TODO: this is not correct.
        };
        newRecipe = {
          ...recipe,
          ingredients: recipe.ingredients.concat([newIngredient]),
        };
        newSelectedIngredientIndex = newRecipe.ingredients.length - 1;
        break;
      case UpdateType.UPDATE_INGREDIENT:
        newSelectedIngredientIndex = state.selectedIngredientIndex;
        newRecipe = {
          ...recipe,
          ingredients: recipe.ingredients.map((ingredient, index) => {
            if (index != update.ingredientIndex) {
              return ingredient;
            }
            return {
              ...ingredient,
              amount:
                update.newAmount === undefined
                  ? ingredient.amount
                  : update.newAmount,
              unit:
                update.newUnit === undefined ? ingredient.unit : update.newUnit,
              ingredient:
                update.newFood === undefined
                  ? ingredient.ingredient
                  : update.newFood,
            };
          }),
        };
        break;
    }

    this.setState({
      type: "Active",
      selectedIngredientIndex: newSelectedIngredientIndex,
      recipes: state.recipes.map((recipe, index) =>
        index == update.recipeIndex ? newRecipe : recipe
      ),
    });
  }

  updateSelectedIngredient(update: {
    newAmount?: string;
    newUnit?: string;
    newFood?: { description: string; url: string | null };
  }) {
    if (this.state.type != "Active") {
      return;
    }
    this.updateDocument({
      type: UpdateType.UPDATE_INGREDIENT,
      recipeIndex: this.state.selectedRecipeIndex,
      ingredientIndex: this.state.selectedIngredientIndex,
      ...update,
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
      });
    } else {
      const update: Update = {
        type: UpdateType.ADD_INGREDIENT,
        recipeIndex: selectedRecipeIndex,
      };
      this.updateDocument(update);
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
            updateAmount={(amount) =>
              this.updateSelectedIngredient({ newAmount: amount })
            }
            updateUnit={(unit) =>
              this.updateSelectedIngredient({ newUnit: unit })
            }
            updateFood={(food) =>
              this.updateSelectedIngredient({ newFood: food })
            }
          />
        );
    }
  }
}
