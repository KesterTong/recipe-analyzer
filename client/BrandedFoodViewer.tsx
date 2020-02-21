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

import { BrandedFood } from "../core/FoodDataCentral";
import { NormalizedFood } from "../core/NormalizedFood";
import { NutrientInfo } from "../core/Nutrients";
import { NutrientsViewer } from "./NutrientsViewer";

interface BrandedFoodViewerProps {
  food: BrandedFood;
  normalizedFood: NormalizedFood;
  nutrientInfos: NutrientInfo[];
  editMode: boolean;
}

export class BrandedFoodViewer extends React.Component<BrandedFoodViewerProps, BrandedFood> {

  state = { ...this.props.food };

  render() {
    let food = this.state;
    if (this.props.editMode) {
      return <React.Fragment>
        <h1>{food.description} <em>{food.brandOwner ? '(' + food.brandOwner + ')' : ''}</em></h1>
        <Form>
          <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                value={food.description}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {this.setState({description: event.target.value})}}
                />
          </Form.Group>
          <Form.Row>
            <Form.Group as={Col} controlId="formHouseholdUnit">
              <Form.Label>Household Units</Form.Label>
              <Form.Control
                value={food.householdServingFullText!}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {this.setState({householdServingFullText: event.target.value})}}
                />
            </Form.Group>
            <Form.Group as={Col} controlId="formServingSize">
              <Form.Label>Serving Size</Form.Label>
              <Form.Control
                type="number"
                value={food.servingSize.toString()}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {this.setState({servingSize: Number(event.target.value)})}}
                />
            </Form.Group>
            <Form.Group as={Col} controlId="formServingSizeUnits">
              <Form.Label>Units</Form.Label>
              <Form.Control
                as="select" value={food.servingSizeUnit}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {this.setState({servingSizeUnit: event.target.value})}}>
                <option>ml</option>
                <option>g</option>
              </Form.Control>
            </Form.Group>
          </Form.Row>
        </Form>
      </React.Fragment>;
    } else {
      return <React.Fragment>
        <h1>{food.description} <em>{food.brandOwner ? '(' + food.brandOwner + ')' : ''}</em></h1>
        { food.ingredients ? <React.Fragment><h2>Ingredients</h2>{food.ingredients}</React.Fragment> : null }
        <h2>Nutrients</h2>
        <NutrientsViewer 
            food={food}
            normalizedFood={this.props.normalizedFood}
            nutrientInfos={this.props.nutrientInfos}
            key={food.description} />
      </React.Fragment>;
    }
  }
}