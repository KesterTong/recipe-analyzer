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

import { Form, Col } from 'react-bootstrap';
import { RootState } from './store';
import { connect } from 'react-redux';
import { Action } from './store/actions';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  updateBrandedFoodDescription,
  updateServingSize,
  updateServingSizeUnit,
  updateHouseholdUnit,
  updateNutrientValue
 } from './store/branded_food/actions';

interface BrandedFoodEditorProps {
  description: string,
  householdServingFullText: string,
  servingSize: string,
  servingSizeUnit: string,
  nutrients: {id: number, description: string, value: string}[],

  updateBrandedFoodDescription(value: string): void,
  updateHouseholdUnit(value: string): void,
  updateServingSize(value: string): void,
  updateServingSizeUnit(value: string): void,
  updateNutrientValue(id: number, value: string): void,
}

const BrandedFoodEditorView: React.SFC<BrandedFoodEditorProps> = props => {
  return <React.Fragment>
      <Form>
        <Form.Group controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              value={props.description}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.updateBrandedFoodDescription(event.target.value)}
              />
        </Form.Group>
        <Form.Row>
          <Form.Group as={Col} controlId="formHouseholdUnit">
            <Form.Label>Household Units</Form.Label>
            <Form.Control
              value={props.householdServingFullText}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.updateHouseholdUnit(event.target.value)}
              />
          </Form.Group>
          <Form.Group as={Col} controlId="formServingSize">
            <Form.Label>Serving Size</Form.Label>
            <Form.Control
              value={props.servingSize}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.updateServingSize(event.target.value)}
              />
          </Form.Group>
          <Form.Group as={Col} controlId="formServingSizeUnits">
            <Form.Label>Units</Form.Label>
            <Form.Control
              as="select"
              value={props.servingSizeUnit}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.updateServingSizeUnit(event.target.value)}
              >
              <option>ml</option>
              <option>g</option>
            </Form.Control>
          </Form.Group>
        </Form.Row>
        { props.nutrients.map(nutrient => (
          <Form.Group controlId={"form-" + nutrient.description}>
            <Form.Label>{nutrient.description}</Form.Label>
            <Form.Control
              value={nutrient.value.toString()}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.updateNutrientValue(nutrient.id, event.target.value)}
              />
          </Form.Group>
        )) }
      </Form>
    </React.Fragment>;
}

function mapStateToProps(state: RootState) {
  if (state.food?.dataType != 'Branded Edit') {
    throw('should not get here');
  }
  let food = state.food;
  let nutrientNamesById: {[index: number]: string} = {};
  (state.nutrientInfos || []).forEach(nutrientInfo => {
    nutrientNamesById[nutrientInfo.id] = nutrientInfo.name;
  });
  const foodId = state.selectedFoodId;
  return {
    description: food.description,
    householdServingFullText: food.householdServingFullText || '',
    servingSize: food.servingSize,
    servingSizeUnit: food.servingSizeUnit,
    editable: foodId && foodId.startsWith('userData/'),
    nutrients: food.foodNutrients.map(nutrient => ({
      id: nutrient.id,
      description: nutrientNamesById[nutrient.id],
      value: nutrient.amount,
    })),
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<RootState, null, Action>) {
  return bindActionCreators({
    updateBrandedFoodDescription,
    updateServingSize,
    updateServingSizeUnit,
    updateHouseholdUnit,
    updateNutrientValue,
  }, dispatch);
}

export const BrandedFoodEditor = connect(mapStateToProps, mapDispatchToProps)(BrandedFoodEditorView);