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
import { LOADING } from "./store/recipe_edit";
import { QueryResult } from "./database";
import { FoodInput } from "./FoodInput";
import { Form, Button } from "react-bootstrap";

export interface IngredientEditorProps {
  amount: number;
  unit: string;
  units: string[];
  queryResult: QueryResult | null;
  nutrients: number[] | LOADING;
}

// TODO: Remove this once we have IngredientEditorContainer.
interface PropsFromDispatch {
  nutrientNames: string[];
  updateIngredientAmount(amount: number): void;
  updateIngredientUnit(unit: string): void;
  loadAndSelectIngredient(queryResult: QueryResult): void;
  deselectIngredient(): void;
  deleteIngredient(): void;
}

export const IngredientEditor: React.FunctionComponent<
  IngredientEditorProps & PropsFromDispatch
> = (props) => (
  <tr className="d-flex">
    <td className="col-1">
      <Form.Control
        value={props.amount.toString()}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          props.updateIngredientAmount(Number(event.target.value))
        }
      />
    </td>
    <td className="col-2">
      <Form.Control
        value={props.unit}
        as="select"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          props.updateIngredientUnit(event.target.value)
        }
      >
        {props.units.map((unit) => (
          <option>{unit}</option>
        ))}
      </Form.Control>
    </td>
    <td className="col-6">
      {
        <FoodInput
          queryResult={props.queryResult}
          select={(queryResult) => props.loadAndSelectIngredient(queryResult)}
          deselect={() => props.deselectIngredient()}
        />
      }
    </td>
    {props.nutrientNames.map((_, index) => {
      const value =
        props.nutrients == "LOADING" ? null : props.nutrients[index];
      return (
        <td className="col-1">{value == null ? "..." : value.toFixed(1)}</td>
      );
    })}
    <td className="col-1">
      <Button onClick={() => props.deleteIngredient()}>Delete</Button>
    </td>
  </tr>
);
