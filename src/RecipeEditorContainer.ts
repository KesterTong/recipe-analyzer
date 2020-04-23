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
import { RootState, ThunkDispatch } from "./store";
import { actions, getNutrientsForIngredient } from "./store/recipe_edit";
import { totalNutrients } from "./core";

function mapStateToProps(state: RootState) {
  const foodState = state.foodState;
  if (foodState?.stateType != "RecipeEdit") {
    return <typeof result>{};
  }
  const nutrientInfos = state.config.nutrientInfos;
  const numIngredients = foodState.ingredients.length;
  const result = {
    description: foodState.description,
    nutrientInfos,
    numIngredients,
    totalNutrients: totalNutrients(
      foodState.ingredients.map((ingredient) =>
        getNutrientsForIngredient(ingredient, foodState.foodCache)
      )
    ),
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
