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

import { Form, Navbar, Container } from 'react-bootstrap';

import { IngredientSearcher } from './IngredientSearcher';
import { Food } from '../core/Food';
import { BrandedFoodViewer } from './BrandedFoodViewer';
import { BrandedFoodEditor } from './BrandedFoodEditor';
import { RecipeViewer } from './RecipeViewer';
import { Action } from './actions';
import { EditButton } from './EditButton';
import { RootState } from './RootState';
import { connect } from 'react-redux';
import { SRLegacyFoodViewer } from './SRLegacyFoodView';

interface IngredientBrowserProps {
  food: Food | null;
  editable: boolean;
  editMode: boolean;
};

const IngredientBrowserView: React.SFC<IngredientBrowserProps> = props => {
  let contents = null;
  let food = props.food;

  if (food) {
    switch (food.dataType) {
      case 'Branded':
        contents = props.editMode ? <BrandedFoodEditor/> : <BrandedFoodViewer/>
        break;
      case 'SR Legacy':
        contents = <SRLegacyFoodViewer/>
        break;
      case 'Recipe':
        contents = <RecipeViewer/>
        break;
    }
  }
  return <React.Fragment>
    <Navbar bg="light" expand="lg">
      <Form inline>
        <IngredientSearcher/>
        <EditButton/>
      </Form>
    </Navbar>
    <Container>
      { contents }
    </Container>
  </React.Fragment>;
}

function mapStateToProps(state: RootState) {
  return {
    food: state.food,
    editable: state.ingredientIdentifier!.identifierType == 'BookmarkId',
    editMode: state.editMode,
  }
}

function mapDispatchToProps(dispatch: React.Dispatch<Action>) {
  return {}
}

export const IngredientBrowser = connect(mapStateToProps, mapDispatchToProps)(IngredientBrowserView);