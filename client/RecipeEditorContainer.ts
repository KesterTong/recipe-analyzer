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
import { RootState } from './RootState';
import { Recipe } from '../core/Recipe';
import { RecipeEditor } from './RecipeEditor';
import { Action, updateDescription, addIngredient, updateIngredientAmount, updateIngredientUnit, updateIngredientId } from './actions';
import { IngredientDatabaseImpl } from './IngredientDatabaseImpl';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { servingEquivalentQuantities } from '../core/normalizeFood';

function mapStateToProps(state: RootState) {
  let food = state.food as Recipe;
  console.log(state)
  return {
    description: food.description,
    ingredientsList: food.ingredientsList.map(ingredient => {
      let food = state.foodsById[ingredient.foodId];
      return {
        amount: ingredient.quantity.amount,
        unit: ingredient.quantity.unit,
        units: (food && food.dataType != 'Loading') ? Object.keys(servingEquivalentQuantities(food)) : ['g'],
        foodRef: food ? {
          foodId: ingredient.foodId,
          description: food.description,
        } : null,
      }
    }),
    autocomplete: (query: string) => new IngredientDatabaseImpl().searchFoods(query),
  }
}

function mapDispatchToProps(dispatch: ThunkDispatch<RootState, null, Action>) {
  return bindActionCreators({
    updateDescription,
    addIngredient,
    updateIngredientAmount,
    updateIngredientUnit,
    updateIngredientId,
  }, dispatch);
}

export const RecipeEditorContainer = connect(mapStateToProps, mapDispatchToProps)(RecipeEditor);