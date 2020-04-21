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
  CircularProgress,
  FormHelperText,
} from "@material-ui/core";
import { isOk, StatusOr, StatusCode, hasCode, Nutrients } from "./core";

export interface IngredientEditorProps {
  amount: string;
  unit: string;
  units: string[];
  selected: food_input.State;
  nutrients: StatusOr<Nutrients>;
  nutrientIds: string[];
  updateAmount(amount: string): void;
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
        value={props.amount}
        error={hasCode(props.nutrients, StatusCode.NAN_AMOUNT)}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          props.updateAmount(event.target.value)
        }
        helperText={
          hasCode(props.nutrients, StatusCode.NAN_AMOUNT)
            ? "Invalid amount"
            : null
        }
      />
    </TableCell>
    <TableCell>
      <FormControl
        error={hasCode(props.nutrients, StatusCode.UNKNOWN_QUANTITY)}
      >
        <Select
          id="unit"
          value={props.unit || ""}
          onChange={(event) => props.updateUnit(event.target.value as string)}
        >
          {props.units.map((unit) => (
            <MenuItem value={unit}>{unit}</MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {hasCode(props.nutrients, StatusCode.UNKNOWN_QUANTITY)
            ? "Unknown quantity"
            : null}
        </FormHelperText>
      </FormControl>
    </TableCell>
    <TableCell>
      {
        <FoodInput
          {...props.selected}
          useSearchAdornment={false}
          select={props.select}
          deselect={props.deselect}
        />
      }
    </TableCell>
    {props.nutrientIds.map((nutrientId) => (
      <TableCell>
        {isOk(props.nutrients) ? (
          props.nutrients[nutrientId].toFixed(1)
        ) : hasCode(props.nutrients, StatusCode.LOADING) ? (
          <CircularProgress />
        ) : (
          <Icon>error</Icon>
        )}
      </TableCell>
    ))}
    <TableCell>
      <IconButton aria-label="delete" onClick={() => props.delete()}>
        <Icon>delete</Icon>
      </IconButton>
    </TableCell>
  </TableRow>
);
