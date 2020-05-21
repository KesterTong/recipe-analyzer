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

import { mapStateToMaybeProps } from "./MaybeComponent";
import { StateProps, Editor } from "./Editor";
import { RootState, ActiveState } from "./RootState";
import {
  nutrientsForIngredient,
  isOk,
  StatusCode,
  makeFdcWebUrl,
  Ingredient,
} from "../core";
import { filterNulls } from "../core/filterNulls";
import { updateDocument, selectIngredient, selectRecipe } from "./actions";
import { ThunkDispatch } from "./store";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

function getSuggestions(query: string, state: ActiveState) {
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

function ingredientDescription(ingredient: Ingredient) {
  return (
    ingredient.amount +
    " " +
    ingredient.unit +
    " " +
    ingredient.ingredient.description
  );
}

const mapStateToProps = mapStateToMaybeProps<RootState, StateProps>((state) => {
  if (state.type !== "Active") {
    return null;
  }
  const selectedRecipe = state.recipes[state.selectedRecipeIndex];
  const ingredientInfos = selectedRecipe.ingredients.map((ingredient) => ({
    description: ingredientDescription(ingredient),
    nutrients: nutrientsForIngredient(
      ingredient,
      state.fdcFoodsById,
      state.conversionData
    ),
  }));
  const selectedIngredient =
    selectedRecipe.ingredients[state.selectedIngredientIndex];
  const selectedIngredientNutrients =
    ingredientInfos[state.selectedIngredientIndex].nutrients;
  // We generate the error for `amount` here as that error is sometimes
  // superceded by other errors in nutrientsForIngredient.
  const amountError = isNaN(Number(selectedIngredient.amount))
    ? "Enter a number"
    : null;
  let unitError = null;
  let foodError = null;
  if (!isOk(selectedIngredientNutrients)) {
    if (selectedIngredientNutrients.code == StatusCode.UNKNOWN_UNIT) {
      unitError = selectedIngredientNutrients.message;
    } else if (selectedIngredientNutrients.code != StatusCode.NAN_AMOUNT) {
      foodError = selectedIngredientNutrients.message;
    }
  }
  return {
    recipeTitles: state.recipes.map((recipe) => recipe.title),
    selectedRecipeIndex: state.selectedRecipeIndex,
    suggestions: getSuggestions("", state),
    ingredientInfos,
    selectedIngredientIndex: state.selectedIngredientIndex,
    selectedIngredient,
    amountError,
    unitError,
    foodError,
    nutrients: state.config.nutrients,
    numDigits: state.config.numDigits,
  };
});

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators(
    {
      updateDocument,
      selectIngredient,
      selectRecipe,
    },
    dispatch
  );
}

export const EditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor);
