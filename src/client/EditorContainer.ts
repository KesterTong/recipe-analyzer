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

const mapStateToProps = mapStateToMaybeProps<RootState, StateProps>((state) => {
  if (state.type !== "Active") {
    return null;
  }
  const recipe = state.recipes[state.selectedRecipeIndex];
  const ingredient = recipe.ingredients[state.selectedIngredientIndex];
  // We generate the error for `amount` here as that error is sometimes
  // superceded by other errors in nutrientsForIngredient.
  const amountError = isNaN(Number(ingredient.amount))
    ? "Enter a number"
    : null;
  const nutrients = nutrientsForIngredient(
    ingredient,
    state.fdcFoodsById,
    state.conversionData
  );
  let unitError = null;
  let foodError = null;
  if (!isOk(nutrients)) {
    if (nutrients.code == StatusCode.UNKNOWN_UNIT) {
      unitError = nutrients.message;
    } else if (nutrients.code != StatusCode.NAN_AMOUNT) {
      foodError = nutrients.message;
    }
  }
  return {
    selectedRecipeIndex: state.selectedRecipeIndex,
    selectedIngredientIndex: state.selectedIngredientIndex,
    numIngredients: recipe.ingredients.length,
    amountError,
    unitError,
    foodError,
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
