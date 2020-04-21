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
import { StatusOr, Nutrients } from "./core";
import {
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Icon,
} from "@material-ui/core";
import { NutrientsHeader } from "./NutrientsHeader";
import { NutrientInfo } from "./store";
import { NutrientsRow } from "./NutrientsRow";

export interface RecipeEditorProps {
  description: string;
  nutrientInfos: NutrientInfo[];
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
      <form>
        <TextField
          id="description"
          label="description"
          value={props.description}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            props.updateDescription(event.target.value)
          }
        />
      </form>
      <Table>
        <TableHead className="d-flex">
          <TableRow>
            <TableCell colSpan={3}>Ingredient</TableCell>
            <NutrientsHeader nutrientInfos={props.nutrientInfos} />
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: props.numIngredients }, (_, index) => (
            <IngredientEditorContainer index={index} />
          ))}
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <NutrientsRow
              nutrients={props.totalNutrients}
              emptyValuesAreZero={true}
              nutrientInfos={props.nutrientInfos}
            />
            <TableCell>
              <IconButton aria-label="add" onClick={props.addIngredient}>
                <Icon>add</Icon>
              </IconButton>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </React.Fragment>
  );
};
