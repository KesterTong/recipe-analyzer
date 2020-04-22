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
import TextField from "@material-ui/core/TextField";
import FormGroup from "@material-ui/core/FormGroup";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import { NutrientsHeader } from "./NutrientsHeader";
import { NutrientInfo } from "./store";
import TableCell from "@material-ui/core/TableCell";

export interface BrandedFoodEditorProps {
  description: string;
  householdServingFullText: string;
  servingSize: string;
  servingSizeUnit: string;
  nutrientInfos: NutrientInfo[];
  nutrients: { [index: number]: string };
  updateDescription(value: string): void;
  updateHouseholdUnit(value: string): void;
  updateServingSize(value: string): void;
  updateServingSizeUnit(value: string): void;
  updateNutrientValue(id: number, value: string): void;
}

export const BrandedFoodEditor: React.FunctionComponent<BrandedFoodEditorProps> = (
  props
) => {
  if (props.description === undefined) {
    return null;
  }
  return (
    <React.Fragment>
      <form>
        <div>
          <TextField
            id="description"
            label="description"
            value={props.description}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              props.updateDescription(event.target.value)
            }
          />
        </div>
        <div>
          <TextField
            id="household-unit"
            label="household unit"
            value={props.householdServingFullText}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              props.updateHouseholdUnit(event.target.value)
            }
          />
          <TextField
            id="serving-size"
            label="serving size"
            value={props.servingSize}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              props.updateServingSize(event.target.value)
            }
          />
          <FormControl>
            <InputLabel id="serving-size-units-label">Quantity</InputLabel>
            <Select
              labelId="serving-size-units-label"
              id="serving-size-units"
              value={props.servingSizeUnit}
              onChange={(event) =>
                props.updateServingSizeUnit(
                  (event.target as HTMLSelectElement).value
                )
              }
            >
              <MenuItem value={"ml"}>ml</MenuItem>
              <MenuItem value={"g"}>g</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div>
          <Table>
            <TableHead>
              <TableRow>
                <NutrientsHeader nutrientInfos={props.nutrientInfos} />
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {props.nutrientInfos.map((nutrientInfo) => (
                  <TableCell>
                    <TextField
                      id={nutrientInfo.name + "-value"}
                      value={props.nutrients[nutrientInfo.id] || ""}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        props.updateNutrientValue(
                          nutrientInfo.id,
                          event.target.value
                        )
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </form>
    </React.Fragment>
  );
};
