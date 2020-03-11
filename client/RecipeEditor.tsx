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

import { Form, Table } from 'react-bootstrap';
import { IngredientSearcher } from './IngredientSearcher';
import { FoodRef } from '../core/FoodRef';

export interface RecipeEditorProps {
  description: string,
  ingredientsList: {
    amount: number,
    unit: string,
    units: string[],
    foodRef: FoodRef,
  }[],
  updateDescription(value: string): void,
  autocomplete(query: string): Promise<FoodRef[]>,
  addIngredient(foodRef: FoodRef): void,
  updateIngredientAmount(index: number, amount: number): void,
  updateIngredientUnit(index: number, unit: string): void,
  updateIngredientIdentifier(index: number, foodRef: FoodRef): void,
}

export const RecipeEditor: React.SFC<RecipeEditorProps> = (props) => {
  return <React.Fragment>
      <Form>
        <Form.Group controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              value={props.description}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.updateDescription(event.target.value)}
              />
        </Form.Group>
      </Form>
      <Form.Label>Ingredients</Form.Label>
      <Table>
        <thead>
          <th>Amount</th>
          <th>Unit</th>
          <th>Ingredient</th>
        </thead>
        <tbody>
          {
            props.ingredientsList.map((ingredient, index) => 
              <tr>
                <td>
                  <Form.Control
                  value={ingredient.amount.toString()}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.updateIngredientAmount(index, Number(event.target.value))}
                  />
                </td>
                <td>
                  <Form.Control
                  value={ingredient.unit}
                  as="select"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.updateIngredientUnit(index, event.target.value)}
                  >
                    {ingredient.units.map(unit =><option>{unit}</option>)}
                  </Form.Control>
                </td>
                <td>
                  <IngredientSearcher
                  key={index}
                  selected={ingredient.foodRef}
                  selectFood={(foodRef: FoodRef) => props.updateIngredientIdentifier(index, foodRef)}
                  autocomplete={props.autocomplete} />
                </td>
              </tr>
            )
          }
          <tr>
            <td>
              <Form.Control disabled={true} value={''}/>
            </td>
            <td>
              <Form.Control disabled={true}  value={''} as="select">
              </Form.Control>
            </td>
            <td>
              <IngredientSearcher selected={null} selectFood={props.addIngredient} autocomplete={props.autocomplete} />
            </td>
          </tr>
        </tbody>
      </Table>
  </React.Fragment>;
}