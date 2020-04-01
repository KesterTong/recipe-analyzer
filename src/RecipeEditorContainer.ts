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

import { connect } from "react-redux";
import { RootState, ThunkDispatch } from "./store";
import { RecipeEditor } from "./RecipeEditor";
import { selectNutrientNames, selectNutrientIds } from "./store";
import { actions, selectQueryResult } from "./store/recipe_edit";
import { bindActionCreators } from "redux";
import { nutrientsForQuantity } from "./core/Quantity";
import { mergeIfStatePropsNotNull } from "./TypesUtil";
import { getIngredientUnits } from "./core/getIngredientUnits";

function mapStateToProps(state: RootState) {
  const recipeState = state.foodState;
  if (recipeState?.stateType != "RecipeEdit") {
    return null;
  }
  const edits = recipeState;
  return {
    description: edits.description,
    nutrientNames: selectNutrientNames(state),
    ingredientsList: edits.ingredients.map((ingredient) => {
      const food = ingredient?.normalizedFood;
      return {
        QueryResult: selectQueryResult(ingredient),
        amount: ingredient ? ingredient.quantity.amount : 0,
        unit: ingredient ? ingredient.quantity.unit : "",
        units: food
          ? getIngredientUnits(food.servingEquivalentQuantities)
          : [""],
        nutrients:
          (food && ingredient
            ? nutrientsForQuantity(ingredient.quantity, food)
            : null) || selectNutrientIds(state).map((_) => 0),
      };
    }),
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators(actions, dispatch);
}

export const RecipeEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeIfStatePropsNotNull
)(RecipeEditor);
