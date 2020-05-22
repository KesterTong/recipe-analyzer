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
import { Ingredient, Update, UpdateType, Nutrients, StatusOr } from "../core";
import { IngredientsTable } from "./IngredientsTable";
import { IngredientEditorContainer } from "./IngredientEditorContainer";
import { MaybeComponent } from "./MaybeComponent";
import { RecipeInputContainer } from "./RecipeInputContainer";
import { IngredientsTableContainer } from "./IngredientsTableContainer";

export interface StateProps {
  selectedRecipeIndex: number;
  selectedIngredientIndex: number;
  numIngredients: number;
  amountError: string | null;
  unitError: string | null;
  foodError: string | null;
}

export interface DispatchProps {
  updateDocument(update: Update): void;
}

export const Editor = MaybeComponent<StateProps, DispatchProps>((props) => {
  return (
    <React.Fragment>
      <RecipeInputContainer />
      <IngredientsTableContainer />

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
          disabled={props.selectedIngredientIndex == props.numIngredients - 1}
        >
          Move down
        </button>
      </div>
      <IngredientEditorContainer />
    </React.Fragment>
  );
});
