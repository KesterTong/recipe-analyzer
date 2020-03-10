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

import { NutrientInfo } from '../core/Nutrients';
import { Recipe, Ingredient } from '../core/Recipe';
import { Form, Table, Col } from 'react-bootstrap';
import { IngredientSearcher } from './IngredientSearcher';
import { FoodRef } from '../core/FoodRef';

export interface RecipeEditorProps {
  description: string,
  ingredientsList: {
    amount: number,
    unit: string,
    foodRef: FoodRef,
  }[],
  updateDescription(value: string): void,
  autocomplete(query: string): Promise<FoodRef[]>,
  addIngredient(foodRef: FoodRef): void,
  updateIngredientAmount(index: number, amount: number): void,
  updateIngredientUnit(index: number, unit: string): void,
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
        {
          props.ingredientsList.map((ingredient, index) => 
            <Form.Row>
              <Form.Group as={Col} controlId="formAmount">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                value={ingredient.amount.toString()}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.updateIngredientAmount(index, Number(event.target.value))}
                />
              </Form.Group>
              <Form.Group as={Col} controlId="formUnit">
                <Form.Label>Unit</Form.Label>
                <Form.Control
                value={ingredient.unit}
                as="select"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.updateIngredientUnit(index, event.target.value)}
                >
                  <option>ml</option>
                  <option>g</option>
                </Form.Control>
              </Form.Group>
              <Form.Group as={Col} controlId="formIngredient">
                <Form.Label>Ingredient</Form.Label>
                <IngredientSearcher key={index} selected={ingredient.foodRef} selectFood={(foodRef: FoodRef) => null} autocomplete={props.autocomplete} />
              </Form.Group>
            </Form.Row>
          )
        }
        <Form.Row>
          <Form.Group as={Col} controlId="formAmount">
            <Form.Label>Amount</Form.Label>
            <Form.Control disabled={true} value={''}/>
          </Form.Group>
          <Form.Group as={Col} controlId="formUnit">
            <Form.Label>Unit</Form.Label>
            <Form.Control disabled={true}  value={''} as="select">
            </Form.Control>
          </Form.Group>
          <Form.Group as={Col} controlId="formIngredient">
            <Form.Label>Ingredient</Form.Label>
            <IngredientSearcher selected={null} selectFood={props.addIngredient} autocomplete={props.autocomplete} />
          </Form.Group>
        </Form.Row>
      </Form>
  </React.Fragment>;
}