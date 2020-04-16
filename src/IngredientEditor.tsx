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
import * as food_input from "./store/food_input";
import { Form, Button } from "react-bootstrap";
import { FoodInput } from "./FoodInput";

export interface IngredientEditorProps {
  amount: number | null;
  unit: string | null;
  units: string[];
  selected: food_input.State;
  nutrients: number[] | LOADING;
  nutrientNames: string[];
  updateAmount(amount: number): void;
  updateUnit(unit: string): void;
  select(foodId: string, description: string): void;
  deselect(): void;
  delete(): void;
}

export const IngredientEditor: React.FunctionComponent<IngredientEditorProps> = (
  props
) => (
  <tr className="d-flex">
    <td className="col-1">
      <Form.Control
        disabled={props.amount === null}
        value={props.amount === null ? "" : props.amount.toString()}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          props.updateAmount(Number(event.target.value))
        }
      />
    </td>
    <td className="col-2">
      <Form.Control
        disabled={props.unit === null}
        value={props.unit || ""}
        as="select"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          props.updateUnit(event.target.value)
        }
      >
        {props.units.map((unit) => (
          <option>{unit}</option>
        ))}
      </Form.Control>
    </td>
    <td className="col-6">
      {<FoodInput {...props.selected} select={props.select} deselect={props.deselect} />}
    </td>
    {props.nutrientNames.map((_, index) => {
      const value =
        props.nutrients == "LOADING" ? null : props.nutrients[index];
      return (
        <td className="col-1">{value == null ? "..." : value.toFixed(1)}</td>
      );
    })}
    <td className="col-1">
      <Button onClick={() => props.delete()}>Delete</Button>
    </td>
  </tr>
);
