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

import * as React from 'react';

import { Form, Navbar, Container, Spinner, Button } from 'react-bootstrap';

import { IngredientSearcher } from './IngredientSearcher';
import { Food } from '../core/Food';
import { BrandedFoodEditor } from './BrandedFoodEditor';
import { Action, selectFood, saveFood, newBrandedFood, newRecipe } from './store/actions';
import { RootState, BrandedFoodState } from './store';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { SRLegacyFoodViewer } from './SRLegacyFoodView';
import { RecipeEditorContainer } from './RecipeEditorContainer';
import { FoodRef } from '../core/FoodRef';
import { searchFoods } from './IngredientDatabaseImpl';
import { ThunkDispatch } from 'redux-thunk';
import { RecipeState } from './store/recipe/types';
import { SRLegacyFood } from '../core/FoodDataCentral';
import { LoadingFood } from './store/RootState';

interface IngredientBrowserProps {
  food: SRLegacyFood | RecipeState | BrandedFoodState | LoadingFood | null,
  selectFoodDisabled: boolean,
  selectedFood: {label: string, value: string}[],
  selectFood(selected: {label: string, value: string}[]): void,
  autocomplete(query: string): Promise<{label: string, value: string}[]>,
  saveFood: () => void,
  newBrandedFood: () => void,
  newRecipe: () => void,
};

const IngredientBrowserView: React.SFC<IngredientBrowserProps> = props => {
  let contents: React.ReactElement | null = null;
  let food = props.food;

  if (food) {
    switch (food.dataType) {
      case 'Branded Edit': 
        contents = <BrandedFoodEditor/>;
        break;
      case 'SR Legacy':
        contents = <SRLegacyFoodViewer/>;
        break;
      case 'Recipe Edit':
        contents = <RecipeEditorContainer/>;
        break;
    }
  }
  return <React.Fragment>
    <Navbar bg="light" expand="lg">
      <Form inline>
        <IngredientSearcher selected={props.selectedFood} disabled={props.selectFoodDisabled} select={props.selectFood} autocomplete={props.autocomplete}/>
        <Button onClick={props.saveFood}>Save</Button>
        <Button onClick={props.newBrandedFood}>New Custom Food</Button>
        <Button onClick={props.newRecipe}>New Recipe</Button>
      </Form>
    </Navbar>
    <Container>
      { contents }
    </Container>
  </React.Fragment>;
}

function mapStateToProps(state: RootState) {
  let selectedFood: {label: string, value: string}[] = state.selectedFoodId && !state.deselected ? [{
    value: state.selectedFoodId,
    label: state.food?.description || 'Loading...',
  }] : [];
  return {
    food: state.food,
    selectedFood,
    selectFoodDisabled: selectedFood.length > 0 && selectedFood[0].label == 'Loading...',
    autocomplete: (query: string) => searchFoods(query)
    .then(results => results.map(foodRef => ({label: foodRef.description, value: foodRef.foodId}))),
  }
}

function mapDispatchToProps(dispatch: ThunkDispatch<RootState, null, Action>) {
  return bindActionCreators({
    selectFood,
    saveFood,
    newBrandedFood,
    newRecipe,
  }, dispatch);
}

export const IngredientBrowser = connect(mapStateToProps, mapDispatchToProps)(IngredientBrowserView);