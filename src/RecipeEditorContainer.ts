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

import { connect } from 'react-redux';
import { RootState, ThunkDispatch } from "./store";
import { RecipeEditor } from './RecipeEditor';
import { updateDescription } from './store/actions';
import { bindActionCreators } from 'redux';
import { nutrientsForQuantity } from '../core/Quantity';
import {
  addIngredient,
  deleteIngredient,
  updateIngredientAmount,
  updateIngredientUnit,
  selectIngredient,
  deselectIngredient,
} from './store/recipe/actions';

function mapStateToProps(state: RootState) {
  console.log(state)
  const recipeState = state.recipeState;
  if (recipeState == null) {
    return {
      hasRecipe: false,
      description: '',
      nutrientNames: [],
      ingredientsList: [],
    }
  }
  const result = {
    hasRecipe: true,
    description: recipeState.description,
    nutrientNames: (state.nutrientInfos || []).map(nutrientInfo => nutrientInfo.name),
    ingredientsList: recipeState.ingredients.map(ingredient => {
      const food = ingredient.normalizedFood;
      return {
        ...ingredient.foodInputState,
        amount: ingredient.quantity.amount,
        unit: ingredient.quantity.unit,
        units: food ? Object.keys(food.servingEquivalentQuantities) : ['g'],
        nutrients: (food ? nutrientsForQuantity(ingredient.quantity, food) : null) || (state.nutrientInfos || []).map(nutrientInfo => 0),
      }
    }),
  };
  console.log(result);
  return result;
}

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators({
    updateDescription,
    addIngredient,
    deleteIngredient,
    updateIngredientAmount,
    updateIngredientUnit,
    selectIngredient,
    deselectIngredient,
  }, dispatch);
}

export const RecipeEditorContainer = connect(mapStateToProps, mapDispatchToProps)(RecipeEditor);