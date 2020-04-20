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
import { FoodInput } from "./FoodInput";
import {
  TableRow,
  TableCell,
  FormControl,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Icon,
} from "@material-ui/core";

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
  <TableRow>
    <TableCell>
      <TextField
        id="amount"
        value={props.amount === null ? "" : props.amount.toString()}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          props.updateAmount(Number(event.target.value))
        }
      />
    </TableCell>
    <TableCell>
      <FormControl>
        <Select
          id="unit"
          value={props.unit || ""}
          onChange={(event) => props.updateUnit(event.target.value as string)}
        >
          {props.units.map((unit) => (
            <MenuItem value={unit}>{unit}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </TableCell>
    <TableCell>
      {
        <FoodInput
          {...props.selected}
          select={props.select}
          deselect={props.deselect}
        />
      }
    </TableCell>
    {props.nutrientNames.map((_, index) => {
      const value =
        props.nutrients == "LOADING" ? null : props.nutrients[index];
      return <TableCell>{value == null ? "..." : value.toFixed(1)}</TableCell>;
    })}
    <TableCell>
      <IconButton aria-label="delete" onClick={() => props.delete()}>
        <Icon>delete</Icon>
      </IconButton>
    </TableCell>
  </TableRow>
);
