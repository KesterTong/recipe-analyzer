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
import { Food } from "./core";
import * as React from "react";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  makeStyles,
} from "@material-ui/core";
import { NutrientInfo } from "./store";
import { NutrientsHeader } from "./NutrientsHeader";

export interface FoodViewerProps {
  food: Food;
  nutrientInfos: NutrientInfo[];
  nutrientValues: number[];
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
              {props.nutrientValues.map((nutrientValue) => (
                <TableCell>{nutrientValue}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </p>
    </React.Fragment>
  );
};
