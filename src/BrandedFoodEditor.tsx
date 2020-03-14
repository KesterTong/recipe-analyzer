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
import { RootState, BrandedFoodEdits } from './store';
import { connect } from 'react-redux';
import { Action } from './actions';

interface BrandedFoodEditorProps {
  description: string,
  householdServingFullText: string,
  servingSize: string,
  servingSizeUnit: string,
  nutrients: {id: number, description: string, value: string}[],

  updateDescription(value: string): void,
  updatehouseholdServingFullText(value: string): void,
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
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.updateDescription(event.target.value)}
              />
        </Form.Group>
        <Form.Row>
          <Form.Group as={Col} controlId="formHouseholdUnit">
            <Form.Label>Household Units</Form.Label>
            <Form.Control
              value={props.householdServingFullText}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.updatehouseholdServingFullText(event.target.value)}
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
  let food = state.food as BrandedFoodEdits;
  let nutrientNamesById: {[index: number]: string} = {};
  (state.nutrientInfos || []).forEach(nutrientInfo => {
    nutrientNamesById[nutrientInfo.id] = nutrientInfo.name;
  });
  return {
    description: food.description,
    householdServingFullText: food.householdServingFullText || '',
    servingSize: food.servingSize,
    servingSizeUnit: food.servingSizeUnit,
    editable: state.foodId && state.foodId.startsWith('userData/'),
    nutrients: food.foodNutrients.map(nutrient => ({
      id: nutrient.id,
      description: nutrientNamesById[nutrient.id],
      value: nutrient.amount,
    })),
  };
}

function mapDispatchToProps(dispatch: React.Dispatch<Action>) {
  return {
    updateDescription: (value: string) => dispatch({
      type: 'UpdateDescription',
      description: value
    }),
    updatehouseholdServingFullText: (value: string) => dispatch({
      type: 'UpdateHouseholdUnit',
      householdUnit: value
    }),
    updateServingSize: (value: string) => dispatch({
      type: 'UpdateServingSize',
      servingSize: value
    }),
    updateServingSizeUnit: (value: string) => dispatch({
      type: 'UpdateServingSizeUnit',
      servingSizeUnit: value
    }),
    updateNutrientValue: (id: number, value: string) => dispatch({
      type: 'UpdateNutrientValue',
      nutrientId: id,
      value: value,
    }),
  }
}

export const BrandedFoodEditor = connect(mapStateToProps, mapDispatchToProps)(BrandedFoodEditorView);