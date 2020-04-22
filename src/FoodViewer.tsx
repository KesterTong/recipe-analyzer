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
import { Food, Nutrients, StatusOr } from "./core";
import * as React from "react";
import { NutrientInfo } from "./store";
import { NutrientsHeader } from "./NutrientsHeader";
import { NutrientsRow } from "./NutrientsRow";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import makeStyles from "@material-ui/core/styles/makeStyles";

export interface FoodViewerProps {
  food: Food;
  nutrientInfos: NutrientInfo[];
  nutrients: StatusOr<Nutrients>;
  quantities: string[];
  selectedQuantity: number;
  setSelectedQuantity: (index: number) => void;
}

export const NO_DISPLAY = {} as FoodViewerProps;

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

export const FoodViewer: React.FunctionComponent<FoodViewerProps> = (props) => {
  if (props.food === undefined) {
    return null;
  }
  const classes = useStyles();
  return (
    <React.Fragment>
      <Typography variant="h4" component="h1" gutterBottom>
        {props.food.description}
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Nutrients
      </Typography>
      <FormControl>
        <InputLabel id="display-quantity-label">Quantity</InputLabel>
        <Select
          labelId="display-quantity-label"
          id="display-quantity-select"
          value={props.selectedQuantity.toString()}
          onChange={(event) =>
            props.setSelectedQuantity(
              Number((event.target as HTMLSelectElement).value)
            )
          }
        >
          {props.quantities.map((quantity, index) => (
            <MenuItem value={index}>{quantity}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <p>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <NutrientsHeader nutrientInfos={props.nutrientInfos} />
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <NutrientsRow
                nutrients={props.nutrients}
                nutrientInfos={props.nutrientInfos}
              />
            </TableRow>
          </TableBody>
        </Table>
      </p>
    </React.Fragment>
  );
};
