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

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { RecipeEditor } from "./RecipeEditor";
import { RootState, ThunkDispatch, getNutrientNames } from "./store";
import { actions, getNutrientsForIngredient } from "./store/recipe_edit";
import { addNutrients, Nutrients } from "./core";

function mapStateToProps(state: RootState) {
  const foodState = state.foodState;
  if (foodState?.stateType != "RecipeEdit") {
    return <typeof result>{};
  }
  const nutrientNames = getNutrientNames(state);
  const numIngredients = foodState.ingredients.length;
  const totalNutrients = foodState.ingredients
    .map((ingredient) =>
      getNutrientsForIngredient(ingredient, foodState.foodCache)
    )
    .reduce(
      (lhs, rhs) => {
        if ("code" in lhs) {
          return lhs;
        }
        if ("code" in rhs) {
          return rhs;
        }
        return addNutrients(lhs, rhs);
      },
      nutrientNames.map(() => 0)
    );
  const result = {
    description: foodState.description,
    nutrientNames,
    numIngredients,
    totalNutrients,
  };
  return result;
}

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators(
    {
      updateDescription: actions.updateDescription,
      addIngredient: actions.addIngredient,
    },
    dispatch
  );
}

export const RecipeEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RecipeEditor);
