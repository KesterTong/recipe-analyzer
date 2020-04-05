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
import * as React from "react";

import { Form, Table, Button } from "react-bootstrap";
import { IngredientEditorContainer } from "./IngredientEditorContainer";

export interface RecipeEditorProps {
  description: string;
  nutrientNames: string[];
  totalNutrients: number[];
  numIngredients: number;
  updateDescription(value: string): void;
  addIngredient(): void;
}

export const RecipeEditor: React.FunctionComponent<RecipeEditorProps> = (
  props
) => {
  if (props.description === undefined) {
    return null;
  }
  return (
    <React.Fragment>
      <Form>
        <Form.Group controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            value={props.description}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              props.updateDescription(event.target.value)
            }
          />
        </Form.Group>
      </Form>
      <Form.Label>Ingredients</Form.Label>
      <Table>
        <thead className="d-flex">
          <th className="col-1">Amount</th>
          <th className="col-2">Unit</th>
          <th className="col-6">Ingredient</th>
          {props.nutrientNames.map((nutrientName) => (
            <th className="col-1">{nutrientName}</th>
          ))}
          <th className="col-1"></th>
        </thead>
        <tbody>
          {Array.from({ length: props.numIngredients }, (_, index) => (
            <IngredientEditorContainer index={index} />
          ))}
          <tr className="d-flex">
            <td className="col-1"></td>
            <td className="col-2"></td>
            <td className="col-6">Total</td>
            {props.totalNutrients.map((value) => (
              <td className="col-1">{value.toFixed(1)}</td>
            ))}
            <td className="col-1">
              <Button onClick={props.addIngredient}>Add</Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </React.Fragment>
  );
};
