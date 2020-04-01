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
import { FoodInput } from "./FoodInput";
import { QueryResult } from "./database";
import { addNutrients } from "./core/Nutrients";
import { isNonEmpty } from "./TypesUtil";

export interface RecipeEditorProps {
  description: string;
  nutrientNames: string[];
  ingredientsList: {
    amount: number;
    unit: string;
    units: string[];
    QueryResult: QueryResult | null;
    nutrients: number[];
  }[];
  updateDescription(value: string): void;
  addIngredient(QueryResult: QueryResult): void;
  updateIngredientAmount(index: number, amount: number): void;
  updateIngredientUnit(index: number, unit: string): void;
  loadAndSelectIngredient(index: number, QueryResult: QueryResult): void;
  deselectIngredient(index: number): void;
  addIngredient(): void;
  deleteIngredient(index: number): void;
}

export const RecipeEditor: React.FunctionComponent<RecipeEditorProps | {}> = (
  props
) => {
  if (!isNonEmpty(props)) {
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
          {props.ingredientsList.map((ingredient, index) => (
            <tr className="d-flex">
              <td className="col-1">
                <Form.Control
                  value={ingredient.amount.toString()}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    props.updateIngredientAmount(
                      index,
                      Number(event.target.value)
                    )
                  }
                />
              </td>
              <td className="col-2">
                <Form.Control
                  value={ingredient.unit}
                  as="select"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    props.updateIngredientUnit(index, event.target.value)
                  }
                >
                  {ingredient.units.map((unit) => (
                    <option>{unit}</option>
                  ))}
                </Form.Control>
              </td>
              <td className="col-6">
                {
                  <FoodInput
                    key={index}
                    QueryResult={ingredient.QueryResult}
                    select={(QueryResult) =>
                      props.loadAndSelectIngredient(index, QueryResult)
                    }
                    deselect={() => props.deselectIngredient(index)}
                  />
                }
              </td>
              {ingredient.nutrients.map((value) => (
                <td className="col-1">{value.toFixed(1)}</td>
              ))}
              <td className="col-1">
                <Button onClick={() => props.deleteIngredient(index)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          <tr className="d-flex">
            <td className="col-1"></td>
            <td className="col-2"></td>
            <td className="col-6">Total</td>
            {props.ingredientsList
              .map((ingredient) => ingredient.nutrients)
              .reduce(
                addNutrients,
                props.nutrientNames.map(() => 0)
              )
              .map((value) => (
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
