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

export interface BrandedFoodEditorProps {
  description: string;
  householdServingFullText: string;
  servingSize: string;
  servingSizeUnit: string;
  nutrients: { id: number; description: string; value: string }[];
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
        <TextField
          id="description"
          label="description"
          value={props.description}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            props.updateDescription(event.target.value)
          }
        />
        <FormGroup>
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
        </FormGroup>
        {props.nutrients.map((nutrient) => (
          <TextField
            id={nutrient.description + "-value"}
            label={nutrient.description}
            value={nutrient.value.toString()}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              props.updateNutrientValue(nutrient.id, event.target.value)
            }
          />
        ))}
      </form>
    </React.Fragment>
  );
};
