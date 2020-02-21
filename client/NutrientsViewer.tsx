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

export interface NutrientsViewProps {
  nutrientsPerServing: Nutrients,
  nutrientInfos: NutrientInfo[],
  quantities: {description: string, servings: number}[],
}

export class NutrientsViewer extends React.Component<NutrientsViewProps, {selectedQuantity: number}>{
  state = {selectedQuantity: 0};
  
  render () {
    let scale = this.props.quantities[this.state.selectedQuantity].servings;
    return (
      <React.Fragment>
        <Form.Control as="select" value={this.props.quantities[this.state.selectedQuantity].description} onChange={this._handleQuantityChange}>
          { this.props.quantities.map(quantity => <option>{quantity.description}</option>) }
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
              {this.props.nutrientInfos.map(nutrientInfo => <td>{this.props.nutrientsPerServing[nutrientInfo.id] * scale}</td>)}
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
      this.props.quantities.forEach((quantity, index) => {
        if (quantity.description == value) {
          this.setState({selectedQuantity: index})
        }
      })
    }
  }
}