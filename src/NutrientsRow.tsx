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

import { NutrientInfo } from "./store";
import { TableCell, CircularProgress, Icon } from "@material-ui/core";
import { Nutrients, StatusOr, isOk, hasCode, StatusCode } from "./core";

export const NutrientsRow: React.FunctionComponent<{
  nutrients: StatusOr<Nutrients>;
  emptyValuesAreZero?: boolean;
  nutrientInfos: NutrientInfo[];
}> = (props) => {
  return (
    <React.Fragment>
      {props.nutrientInfos.map((nutrientInfo) => (
        <TableCell>
          {isOk(props.nutrients) ? (
            props.nutrients[nutrientInfo.id] ? (
              props.nutrients[nutrientInfo.id].toFixed(1)
            ) : props.emptyValuesAreZero ? (
              "0.0"
            ) : (
              ""
            )
          ) : hasCode(props.nutrients, StatusCode.LOADING) ? (
            <CircularProgress />
          ) : (
            <Icon>error</Icon>
          )}
        </TableCell>
      ))}
    </React.Fragment>
  );
};
