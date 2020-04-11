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
import { RootState, ThunkDispatch, getNutrientNames } from "./store";
import {
  actions,
  getNutrientsForIngredient,
  makeGetIngredientUnits,
} from "./store/recipe_edit";
import { Nutrients } from "./core";
import { IngredientEditor } from "./IngredientEditor";
import { QueryResult } from "./database";
import { SelectedFood } from "./store/food_input";

function mapStateToProps() {
  const getIngredientUnits = makeGetIngredientUnits();
  return (state: RootState, ownProps: { index: number }) => {
    const foodState = state.foodState;
    if (foodState?.stateType != "RecipeEdit") {
      return <typeof result>{};
    }
    const { index } = ownProps;
    const ingredient = foodState.ingredients[index];
    if (ingredient === undefined) {
      return <typeof result>{};
    }
    const result = {
      selected: ingredient.selected,
      amount: ingredient ? ingredient.amount : null,
      unit: ingredient ? ingredient.unit : null,
      units: getIngredientUnits(ingredient),
      nutrients: <"LOADING" | Nutrients>getNutrientsForIngredient(ingredient),
      nutrientNames: getNutrientNames(state),
    };
    return result;
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch,
  ownProps: { index: number }
) {
  const { index } = ownProps;
  return bindActionCreators(
    {
      updateIngredientAmount: (amount: number) =>
        actions.updateIngredientAmount(index, amount),
      updateIngredientUnit: (unit: string) =>
        actions.updateIngredientUnit(index, unit),
      select: (selected: SelectedFood | null) =>
        actions.selectAndMaybeLoadIngredient(index, selected),
      deleteIngredient: () => actions.deleteIngredient(index),
    },
    dispatch
  );
}

export const IngredientEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(IngredientEditor);
