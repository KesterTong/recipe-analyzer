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

import { selectIngredient, selectRecipe } from "./actions";
import { mapStateToMaybeProps } from "./MaybeComponent";
import { RootState } from "./RootState";
import { StateProps, IngredientsTable } from "./IngredientsTable";
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "./store";
import { connect } from "react-redux";
import { nutrientsForIngredient, Nutrients, isOk, addNutrients } from "../core";

const mapStateToProps = mapStateToMaybeProps<RootState, StateProps>(
  (state: RootState) => {
    if (state.type != "Active") {
      return null;
    }
    const recipeIndexByUrl: { [index: string]: number } = {};
    state.recipes.forEach((recipe, index) => {
      recipeIndexByUrl[recipe.url] = index;
    });
    const selectedRecipe = state.recipes[state.selectedRecipeIndex];
    const ingredientInfos = selectedRecipe.ingredients.map((ingredient) => ({
      ingredient,
      nutrients: nutrientsForIngredient(
        ingredient,
        state.normalizedFoodsByUrl,
        state.recipes,
        state.config
      ),
    }));
    let totalNutrients: Nutrients = {};
    ingredientInfos.forEach(({ nutrients }) => {
      if (isOk(nutrients)) {
        totalNutrients = addNutrients(totalNutrients, nutrients);
      }
    });
    return {
      ingredientInfos,
      selectedIngredientIndex: state.selectedIngredientIndex,
      config: state.config,
      totalNutrients,
      recipeIndexByUrl,
    };
  }
);

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators(
    {
      selectIngredient,
      selectRecipe,
    },
    dispatch
  );
}

export const IngredientsTableContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(IngredientsTable);
