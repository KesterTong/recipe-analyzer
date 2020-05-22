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

import { selectIngredient } from "./actions";
import { mapStateToMaybeProps } from "./MaybeComponent";
import { RootState } from "./RootState";
import { StateProps, IngredientsTable } from "./IngredientsTable";
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "./store";
import { connect } from "react-redux";
import {
  Ingredient,
  nutrientsForIngredient,
  Nutrients,
  isOk,
  addNutrients,
} from "../core";

function ingredientDescription(ingredient: Ingredient) {
  return (
    ingredient.amount +
    " " +
    ingredient.unit +
    " " +
    ingredient.ingredient.description
  );
}

const mapStateToProps = mapStateToMaybeProps<RootState, StateProps>(
  (state: RootState) => {
    if (state.type != "Active") {
      return null;
    }

    const selectedRecipe = state.recipes[state.selectedRecipeIndex];
    const ingredientInfos = selectedRecipe.ingredients.map((ingredient) => ({
      description: ingredientDescription(ingredient),
      nutrients: nutrientsForIngredient(
        ingredient,
        state.fdcFoodsById,
        state.recipes,
        state.conversionData
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
      nutrients: state.config.nutrients,
      numDigits: state.config.numDigits,
      totalNutrients,
    };
  }
);

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators(
    {
      selectIngredient,
    },
    dispatch
  );
}

export const IngredientsTableContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(IngredientsTable);
