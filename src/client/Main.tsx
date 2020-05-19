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
import {
  Update,
  UpdateType,
  makeFdcWebUrl,
  Recipe,
  NormalizedFood,
  updateRecipes,
  Ingredient,
  fetchFdcFoods,
  StatusOr,
  isOk,
  isError,
  parseFdcWebUrl,
} from "../core";
import { Editor } from "./Editor";
import { debounce } from "./debounce";
import { updateDocument, parseDocument } from "./doc";
import { filterNulls } from "../core/filterNulls";

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
  fdcFoodsById: { [index: number]: StatusOr<NormalizedFood> };
}
export type RootState = LoadingState | ErrorState | ActiveState;

export class Main extends React.Component<{}, RootState> {
  private updateServerDocument: (update: Update) => Promise<void>;

  constructor(props: {}) {
    super(props);
    this.state = {
      type: "Loading",
    };
    this.updateServerDocument = debounce(updateDocument);
    this.initialize();
  }

  async initialize() {
    try {
      const recipes = await parseDocument();
      const fdcFoodsById = await fetchFdcFoods(recipes);
      this.setState({
        type: "Active",
        recipes,
        fdcFoodsById,
        selectedRecipeIndex: 0, // TODO: handle empty recipe set.
        selectedIngredientIndex: 0,
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

  updateDocument(update: Update) {
    if (this.state.type != "Active") {
      return;
    }
    // We update the document on the server side asynchronously.
    this.updateServerDocument(update);
    let newRecipes = updateRecipes(this.state.recipes, update);
    this.setState({
      type: "Active",
      recipes: newRecipes,
    });
    // Load any ingredients that need loading
    fetchFdcFoods(newRecipes, this.state.fdcFoodsById).then(
      (newFdcFoodsById) => {
        if (this.state.type != "Active") {
          return;
        }
        this.setState({
          type: "Active",
          fdcFoodsById: {
            ...this.state.fdcFoodsById,
            ...newFdcFoodsById,
          },
        });
      }
    );
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

  deleteSelectedIngredient() {
    if (this.state.type != "Active") {
      return;
    }
    this.updateDocument({
      type: UpdateType.DELETE_INGREDIENT,
      recipeIndex: this.state.selectedRecipeIndex,
      ingredientIndex: this.state.selectedIngredientIndex,
    });
    this.setState({
      type: "Active",
      selectedIngredientIndex: 0,
    });
  }

  moveSelectedIngredientUpward() {
    if (this.state.type != "Active") {
      return;
    }
    if (this.state.selectedIngredientIndex == 0) {
      return;
    }
    this.updateDocument({
      type: UpdateType.SWAP_INGREDIENTS,
      recipeIndex: this.state.selectedRecipeIndex,
      firstIngredientIndex: this.state.selectedIngredientIndex - 1,
    });
    this.setState({
      type: "Active",
      selectedIngredientIndex: this.state.selectedIngredientIndex - 1,
    });
  }

  moveSelectedIngredientDownward() {
    if (this.state.type != "Active") {
      return;
    }
    if (
      this.state.selectedIngredientIndex ==
      this.state.recipes[this.state.selectedRecipeIndex].ingredients.length - 1
    ) {
      return;
    }
    this.updateDocument({
      type: UpdateType.SWAP_INGREDIENTS,
      recipeIndex: this.state.selectedRecipeIndex,
      firstIngredientIndex: this.state.selectedIngredientIndex,
    });
    this.setState({
      type: "Active",
      selectedIngredientIndex: this.state.selectedIngredientIndex + 1,
    });
  }

  selectIngredient(index: number) {
    if (this.state.type != "Active") {
      return;
    }
    this.setState({
      type: "Active",
      selectedIngredientIndex: index,
    });
  }

  async newIngredient() {
    if (this.state.type != "Active") {
      return;
    }
    const selectedRecipeIndex = this.state.selectedRecipeIndex;
    const currentNumIngredients = this.state.recipes[selectedRecipeIndex]
      .ingredients.length;
    this.updateDocument({
      type: UpdateType.ADD_INGREDIENT,
      recipeIndex: selectedRecipeIndex,
    });
    this.setState({
      type: "Active",
      selectedIngredientIndex: currentNumIngredients,
    });
  }

  getSuggestions(query: string, state: ActiveState) {
    return state.recipes
      .map((recipe) => ({
        description: recipe.title,
        url: recipe.url,
      }))
      .concat(
        filterNulls(
          Object.entries(state.fdcFoodsById).map((entry) =>
            isOk(entry[1])
              ? {
                  url: makeFdcWebUrl(Number(entry[0])),
                  description: entry[1].description,
                }
              : null
          )
        )
      );
  }

  ingredientDisplayString(ingredient: Ingredient) {
    return (
      ingredient.amount +
      " " +
      ingredient.unit +
      " " +
      ingredient.ingredient.description
    );
  }

  getEditorProps(state: ActiveState) {
    const selectedRecipe = state.recipes[state.selectedRecipeIndex];
    const selectedIngredient = selectedRecipe.ingredients[state.selectedIngredientIndex];
    let selectedIngredientError: string | null = null;
    if (selectedIngredient.ingredient.url) {
      const fdcId = parseFdcWebUrl(selectedIngredient.ingredient.url);
      if (fdcId !== null) {
        const statusOrFood = state.fdcFoodsById[fdcId];
        if (statusOrFood === undefined) {
          selectedIngredientError = "Loading...";
        } else if (isError(statusOrFood)) {
          console.log(statusOrFood)
          selectedIngredientError = statusOrFood.message;
        }
      }
    }
    return {
      recipeTitles: state.recipes.map((recipe) => recipe.title),
      selectedRecipeIndex: state.selectedRecipeIndex,
      suggestions: this.getSuggestions("", state),
      ingredientDisplayStrings: selectedRecipe.ingredients.map(
        this.ingredientDisplayString
      ),
      selectedIngredientIndex: state.selectedIngredientIndex,
      selectedIngredient,
      selectedIngredientError,
    };
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
            {...this.getEditorProps(this.state)}
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
            deleteIngredient={() => this.deleteSelectedIngredient()}
            newIngredient={() => this.newIngredient()}
            moveUpward={() => this.moveSelectedIngredientUpward()}
            moveDownward={() => this.moveSelectedIngredientDownward()}
          />
        );
    }
  }
}
