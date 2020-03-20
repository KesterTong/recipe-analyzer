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
import { BrandedFoodEditor } from './BrandedFoodEditor';
import { selectFood, saveFood, newBrandedFood, newRecipe } from './store/actions';
import { RootState } from './store';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { SRLegacyFoodViewer } from './SRLegacyFoodView';
import { RecipeEditorContainer } from './RecipeEditorContainer';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from './store/types';

interface IngredientBrowserProps {
  selectFoodDisabled: boolean,
  selectedFood: {label: string, value: string}[],
  selectFood(selected: {label: string, value: string}[]): void,
  saveFood: () => void,
  newBrandedFood: () => void,
  newRecipe: () => void,
};

const IngredientBrowserView: React.SFC<IngredientBrowserProps> = props => {
  return <React.Fragment>
    <Navbar bg="light" expand="lg">
      <Form inline>
        <IngredientSearcher selected={props.selectedFood} disabled={props.selectFoodDisabled} select={props.selectFood} />
        <Button onClick={props.saveFood}>Save</Button>
        <Button onClick={props.newBrandedFood}>New Custom Food</Button>
        <Button onClick={props.newRecipe}>New Recipe</Button>
      </Form>
    </Navbar>
    <Container>
      <BrandedFoodEditor/>
      <RecipeEditorContainer/>
      <SRLegacyFoodViewer/>
    </Container>
  </React.Fragment>;
}

function mapStateToProps(state: RootState) {
  let selectedFood: {label: string, value: string}[] = state.selectedFood.foodId && !state.selectedFood.deselected ? [{
    value: state.selectedFood.foodId,
    label: state.selectedFood.description || 'Loading...',
  }] : [];
  return {
    selectedFood,
    selectFoodDisabled: selectedFood.length > 0 && selectedFood[0].label == 'Loading...',
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