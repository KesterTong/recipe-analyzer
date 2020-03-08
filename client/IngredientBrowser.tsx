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
import { BrandedFoodViewer } from './BrandedFoodViewer';
import { BrandedFoodEditor } from './BrandedFoodEditor';
import { Action, selectFood, toggleEditMode, newBrandedFood } from './actions';
import { RootState, LoadingFood, BrandedFoodEdits } from './RootState';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { SRLegacyFoodViewer } from './SRLegacyFoodView';
import { RecipeViewerContainer } from './RecipeViewerContainer';
import { FoodRef, IngredientIdentifier } from '../core/FoodRef';
import { IngredientDatabaseImpl } from './IngredientDatabaseImpl';
import { ThunkDispatch } from 'redux-thunk';
import { EditButton } from './EditButton';

interface IngredientBrowserProps {
  food: Food | LoadingFood | BrandedFoodEdits | null,
  editable: boolean,
  editMode: boolean,
  selected: FoodRef | null,
  selectFood(ingredientIdentifier: IngredientIdentifier, description: string): void,
  autocomplete(query: string): Promise<FoodRef[]>,
  toggleEditMode: () => void,
  newBrandedFood: () => void,
};

const IngredientBrowserView: React.SFC<IngredientBrowserProps> = props => {
  let contents: React.ReactElement | null = null;
  let food = props.food;

  if (food) {
    switch (food.dataType) {
      case 'Branded':
        contents = <BrandedFoodViewer/>;
        break;
      case 'Branded Edit': 
        contents = <BrandedFoodEditor/>;
        break;
      case 'SR Legacy':
        contents = <SRLegacyFoodViewer/>;
        break;
      case 'Recipe':
        contents = <RecipeViewerContainer/>;
        break;
      case 'Loading': 
        contents = <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
        break;
    }
  }
  return <React.Fragment>
    <Navbar bg="light" expand="lg">
      <Form inline>
        <IngredientSearcher selected={props.selected} selectFood={props.selectFood} autocomplete={props.autocomplete}/>
        <EditButton editable={props.editable} editMode={props.editMode} toggleEditMode={props.toggleEditMode}/>
        <Button onClick={props.newBrandedFood}>New Custom Food</Button>
      </Form>
    </Navbar>
    <Container>
      { contents }
    </Container>
  </React.Fragment>;
}

function mapStateToProps(state: RootState) {
  let identifier = state.ingredientIdentifier;
  return {
    food: state.food,
    editable: state.ingredientIdentifier?.identifierType == 'BookmarkId',
    editMode: state.food?.dataType == 'Branded Edit',
    selected: identifier ? {description: state.food?.description || '', identifier} : null,
    autocomplete: (query: string) => new IngredientDatabaseImpl().searchFoods(query),
  }
}

function mapDispatchToProps(dispatch: ThunkDispatch<RootState, null, Action>) {
  return bindActionCreators({
    selectFood,
    toggleEditMode,
    newBrandedFood,
  }, dispatch);
}

export const IngredientBrowser = connect(mapStateToProps, mapDispatchToProps)(IngredientBrowserView);