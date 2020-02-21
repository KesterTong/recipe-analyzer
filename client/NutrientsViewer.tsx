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
import { Food } from '../core/Food';
import { NutrientInfo } from '../core/Nutrients';
import { normalizeFood } from '../core/normalizeFood';
import { Form, Table } from 'react-bootstrap';
import { NormalizedFood } from '../core/NormalizedFood';


function getQuantities(food: Food): {description: string, servings: number}[] {
  switch (food.dataType) {
    case 'Recipe':
      return [{description: '1 serving', servings: 1}];
    case 'Branded':
      return [{
        description: food.householdServingFullText! + ' (' + food.servingSize + ' ' + food.servingSizeUnit + ')',
        servings: food.servingSize / 100
      }, {
        description: '100 ' + food.servingSizeUnit,
        servings: 1,
      }];
    case 'SR Legacy':
      let result = [{description: '100 g', servings: 1}];
      food.foodPortions.forEach(portion => {
        let description = portion.amount.toString() + ' ' + portion.modifier + ' (' + portion.gramWeight + ' g)';
        result.push({description, servings: portion.gramWeight / 100});
      });
      return result;
  }
}

interface NutrientsViewProps {
  food: Food,
  normalizedFood: NormalizedFood,
  nutrientInfos: NutrientInfo[],
}

export class NutrientsViewer extends React.Component<NutrientsViewProps, {selectedQuantity: number}>{
  state = {selectedQuantity: 0};
  
  render () {
    let normalized = this.props.normalizedFood;
    let quantities = getQuantities(this.props.food);
    let scale = quantities[this.state.selectedQuantity].servings;
    return (
      <React.Fragment>
        <Form.Control as="select" value={quantities[this.state.selectedQuantity].description} onChange={this._handleQuantityChange}>
          { quantities.map(quantity => <option>{quantity.description}</option>) }
        </Form.Control>
        <p>
        <Table striped bordered hover>
          <thead>
            <tr>
              {this.props.nutrientInfos.map(nutrientInfo => <th>{nutrientInfo.name}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              {this.props.nutrientInfos.map(nutrientInfo => <td>{normalized.nutrientsPerServing[nutrientInfo.id] * scale}</td>)}
            </tr>
          </tbody>
        </Table>
        </p>
      </React.Fragment>
    );
  }

  _handleQuantityChange = (event: React.FormEvent) => {
    if (event.target instanceof HTMLSelectElement) {
      let value = event.target.value;
      getQuantities(this.props.food).forEach((quantity, index) => {
        if (quantity.description == value) {
          this.setState({selectedQuantity: index})
        }
      })
    }
  }
}