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

import { RootState, ActiveState } from "./RootState";
import { StateProps } from "./IngredientEditor";
import { ThunkDispatch } from "./store";
import { bindActionCreators } from "redux";
import { updateDocument } from "./actions";
import { nutrientsForIngredient, isOk, UpdateType } from "../core";
import { connect } from "react-redux";
import { IngredientEditor } from "./IngredientEditor";
import { mapStateToMaybeProps } from "./MaybeComponent";
import { filterNulls } from "../core/filterNulls";

// Unfiltered suggestions of all recipes other than this recipe
// and all ingredients in all recipes.
function getSuggestions(state: ActiveState) {
  return state.recipes
    .filter((_, index) => index != state.selectedRecipeIndex)
    .map((recipe) => ({
      description: recipe.title,
      url: recipe.url,
    }))
    .concat(
      filterNulls(
        Object.entries(state.normalizedFoodsByUrl).map(
          ([url, normalizedFood]) =>
            isOk(normalizedFood)
              ? {
                  url,
                  description: normalizedFood.description,
                }
              : null
        )
      )
    );
}

const mapStateToProps = mapStateToMaybeProps<RootState, StateProps>(
  (state: RootState) => {
    if (state.type != "Active") {
      return null;
    }
    const recipe = state.recipes[state.selectedRecipeIndex];
    const ingredient = recipe.ingredients[state.selectedIngredientIndex];
    const nutrients = nutrientsForIngredient(
      ingredient,
      state.normalizedFoodsByUrl,
      state.recipes,
      state.config
    );
    return {
      ingredient,
      nutrients,
      suggestions: getSuggestions(state),
      updateContext: {
        type: UpdateType.UPDATE_INGREDIENT,
        recipeIndex: state.selectedRecipeIndex,
        ingredientIndex: state.selectedIngredientIndex,
      },
      config: state.config,
    };
  }
);

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators(
    {
      updateDocument,
    },
    dispatch
  );
}

export const IngredientEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(IngredientEditor);
