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

export const BrandedFoodViewer: React.SFC<{food: BrandedFood, normalizedFood: NormalizedFood, nutrientInfos: NutrientInfo[], editMode: boolean}> = (props) => {
  let food = props.food;
  if (props.editMode) {
    return <React.Fragment>
      <h1>{food.description} <em>{food.brandOwner ? '(' + food.brandOwner + ')' : ''}</em></h1>
      <Form>
        <Form.Row>
          <Form.Group as={Col} controlId="formHouseholdUnit">
            <Form.Label>Household Units</Form.Label>
            <Form.Control value={food.householdServingFullText!} />
          </Form.Group>
          <Form.Group as={Col} controlId="formServingSize">
            <Form.Label>Serving Size</Form.Label>
            <Form.Control type="number" value={food.servingSize.toString()}/>
          </Form.Group>
          <Form.Group as={Col} controlId="formServingSizeUnits">
            <Form.Label>Units</Form.Label>
            <Form.Control as="select" value={food.servingSizeUnit}>
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
          normalizedFood={props.normalizedFood}
          nutrientInfos={props.nutrientInfos}
          key={food.description} />
    </React.Fragment>;
  }
}