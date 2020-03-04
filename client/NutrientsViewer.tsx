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
import { NutrientInfo, Nutrients } from '../core/Nutrients';
import { Form, Table } from 'react-bootstrap';
import { RootState } from './RootState';
import { connect } from 'react-redux';
import { Action } from './actions';
import { timingSafeEqual } from 'crypto';

interface NutrientsViewProps {
  nutrientNames: string[],
  nutrientValues: number[],
  quantities: string[],
  selectedQuantity: number,
  selectQuantity: (event: React.FormEvent) => void,
}

const NutrientsViewerView: React.SFC<NutrientsViewProps> = (props) => {
  return (
    <React.Fragment>
      <Form.Control as="select" value={props.selectedQuantity.toString()} onChange={props.selectQuantity}>
        { props.quantities.map((quantity, index) => <option value={index}>{quantity}</option>) }
      </Form.Control>
      <p>
      <Table striped bordered hover>
        <thead>
          <tr>
            {props.nutrientNames.map(nutrientName => <th>{nutrientName}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            {props.nutrientValues.map(nutrientValue => <td>{nutrientValue}</td>)}
          </tr>
        </tbody>
      </Table>
      </p>
    </React.Fragment>
  );
}

function mapStateToProps(state: RootState) {
  let food = state.food;
  if (food == null || state.nutrientInfos == null || state.normalizedFood == null) {
    return {
      nutrientNames: [],
      nutrientValues: [],
      quantities: ['-'],
      selectedQuantity: 0,
    };
  }
  let quantities: {description: string, servings: number}[];
  switch (food.dataType) {
    case 'Recipe':
      quantities = [{description: '1 serving', servings: 1}];
      break;
    case 'Branded':
      quantities = [{
        description: food.householdServingFullText! + ' (' + food.servingSize + ' ' + food.servingSizeUnit + ')',
        servings: food.servingSize / 100
      }, {
        description: '100 ' + food.servingSizeUnit,
        servings: 1,
      }];
      break;
    case 'SR Legacy':
      quantities = [{description: '100 g', servings: 1}];
      food.foodPortions.forEach(portion => {
        let description = portion.amount.toString() + ' ' + portion.modifier + ' (' + portion.gramWeight + ' g)';
        quantities.push({description, servings: portion.gramWeight / 100});
      });
      break;
  }
  let scale = quantities[state.selectedQuantity].servings;
  let nutrientsPerServing = state.normalizedFood!.nutrientsPerServing;
  return {
    nutrientNames: state.nutrientInfos.map(nutrientInfo => nutrientInfo.name),
    nutrientValues: state.nutrientInfos.map(nutrientInfo => nutrientsPerServing[nutrientInfo.id] * scale),
    quantities: quantities.map(quantity => quantity.description),
    selectedQuantity: state.selectedQuantity,
  };
}

function mapDispatchToProps(dispatch: React.Dispatch<Action>) {
  return {
    selectQuantity: (event: React.FormEvent) => {
      if (event.target instanceof HTMLSelectElement) {
        dispatch({
          type: 'SetSelectedQuantity',
          index: Number(event.target.value),
        });
      }
    }
  };
}

export const NutrientsViewer = connect(mapStateToProps, mapDispatchToProps)(NutrientsViewerView);