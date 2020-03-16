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
import { RootState } from "./store";
import { Recipe } from '../core/Recipe';
import { RecipeEditor } from './RecipeEditor';
import { Action } from './store/actions';
import { IngredientDatabaseImpl } from './IngredientDatabaseImpl';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { nutrientsForQuantity } from '../core/Quantity';
import {
  updateDescription,
  addIngredient,
  updateIngredientAmount,
  updateIngredientUnit,
  updateIngredientId,
} from './store/recipe/actions';

function mapStateToProps(state: RootState) {
  const recipeState = state.food;
  if (recipeState?.dataType != 'Recipe Edit') {
    throw("Should not get here");
  }
  return {
    description: recipeState.description,
    nutrientNames: (state.nutrientInfos || []).map(nutrientInfo => nutrientInfo.name),
    ingredientsList: recipeState.ingredients.map(ingredient => {
      const food = recipeState.foodsById[ingredient.foodId];
      const selected: {label: string, value: string}[] = ingredient.foodId && !ingredient.deselected ? [{
        value: ingredient.foodId,
        label: recipeState.foodsById[ingredient.foodId]?.description || 'Loading...',
      }] : [];
      return {
        amount: ingredient.quantity.amount,
        unit: ingredient.quantity.unit,
        units: food ? Object.keys(food.servingEquivalentQuantities) : ['g'],
        selected,
        disabled: selected.length > 0 && selected[0].label == 'Loading...',
        nutrients: food?.dataType == 'NormalizedFood' ? nutrientsForQuantity(ingredient.quantity, food)! : (state.nutrientInfos || []).map(nutrientInfo => 0),
      }
    }),
    autocomplete: (query: string) => new IngredientDatabaseImpl().searchFoods(query)
    .then(result => result.map(foodRef => ({label: foodRef.description, value: foodRef.foodId}))),
  }
}

function mapDispatchToProps(dispatch: ThunkDispatch<RootState, null, Action>) {
  return bindActionCreators({
    updateDescription,
    addIngredient,
    updateIngredientAmount,
    updateIngredientUnit,
    select: updateIngredientId,
  }, dispatch);
}

export const RecipeEditorContainer = connect(mapStateToProps, mapDispatchToProps)(RecipeEditor);