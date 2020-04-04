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
import { RecipeEditor, IngredientProps } from "./RecipeEditor";
import { RootState, ThunkDispatch, selectNutrientNames } from "./store";
import {
  actions,
  selectQueryResult,
  selectNutrientsForIngredient,
  selectIngredientUnits,
} from "./store/recipe_edit";
import { getIngredientUnits, addNutrients, Nutrients } from "./core";

function mapStateToProps(state: RootState) {
  const foodState = state.foodState;
  if (foodState?.stateType != "RecipeEdit") {
    return <typeof result>{};
  }
  const nutrientNames = selectNutrientNames(state);
  const ingredientsList = foodState.ingredients.map<IngredientProps>(
    (ingredient) => {
      return {
        queryResult: selectQueryResult(ingredient),
        amount: ingredient ? ingredient.amount : 0,
        unit: ingredient ? ingredient.unit : "",
        units: selectIngredientUnits(ingredient),
        nutrients: selectNutrientsForIngredient(ingredient),
      };
    }
  );
  const totalNutrients = ingredientsList
    .map((ingredient) => ingredient.nutrients)
    .filter((e): e is Nutrients => e != "LOADING")
    .reduce(
      addNutrients,
      nutrientNames.map(() => 0)
    );
  const result = {
    description: foodState.description,
    nutrientNames,
    ingredientsList,
    totalNutrients,
  };
  return result;
}

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators(actions, dispatch);
}

export const RecipeEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RecipeEditor);
