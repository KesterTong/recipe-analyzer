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

import { IngredientEditorContainer } from "./IngredientEditorContainer";
import { StatusOr, Nutrients, isOk, hasCode, StatusCode } from "./core";
import {
  FormGroup,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Typography,
  IconButton,
  Icon,
  CircularProgress,
} from "@material-ui/core";

export interface RecipeEditorProps {
  description: string;
  nutrientIds: string[];
  nutrientNames: string[];
  totalNutrients: StatusOr<Nutrients>;
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
      <TextField
        id="description"
        label="description"
        value={props.description}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          props.updateDescription(event.target.value)
        }
      />
      <Typography variant="h5" component="h2" gutterBottom>
        Ingredients
      </Typography>
      <Table>
        <TableHead className="d-flex">
          <TableRow>
            <TableCell>Amount</TableCell>
            <TableCell>Unit</TableCell>
            <TableCell>Ingredient</TableCell>
            {props.nutrientNames.map((nutrientName) => (
              <TableCell>{nutrientName}</TableCell>
            ))}
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: props.numIngredients }, (_, index) => (
            <IngredientEditorContainer index={index} />
          ))}
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell>Total</TableCell>
            {props.nutrientIds.map((nutrientId) => (
              <TableCell>
                {isOk(props.totalNutrients) ? (
                  props.totalNutrients[nutrientId].toFixed(1)
                ) : hasCode(props.totalNutrients, StatusCode.LOADING) ? (
                  <CircularProgress />
                ) : (
                  <Icon>error</Icon>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </React.Fragment>
  );
};
