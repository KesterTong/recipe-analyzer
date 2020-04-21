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
import { RootState, ThunkDispatch, getNutrientIds } from "./store";
import {
  actions,
  getNutrientsForIngredient,
  makeGetIngredientUnits,
} from "./store/recipe_edit";
import { Nutrients } from "./core";
import { IngredientEditor } from "./IngredientEditor";
import {
  updateAmount,
  updateUnit,
  updateFoodInput,
} from "./store/ingredient/actions";
import { deselect } from "./store/food_input";

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
      selected: {
        ...ingredient.selected,
        description:
          ingredient.selected.foodId == null
            ? null
            : foodState.foodCache[ingredient.selected.foodId]?.description ||
              null,
      },
      amount: ingredient.amount,
      unit: ingredient.unit,
      units: getIngredientUnits(foodState, index),
      nutrients: getNutrientsForIngredient(ingredient, foodState.foodCache),
      nutrientIds: getNutrientIds(state),
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
      updateAmount: (amount: string) =>
        actions.updateIngredient(index, updateAmount(amount)),
      updateUnit: (unit: string) =>
        actions.updateIngredient(index, updateUnit(unit)),
      select: (foodId: string, description: string) =>
        actions.selectAndLoadIngredient(index, foodId, description),
      deselect: () =>
        actions.updateIngredient(index, updateFoodInput(deselect())),
      delete: () => actions.deleteIngredient(index),
    },
    dispatch
  );
}

export const IngredientEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(IngredientEditor);
