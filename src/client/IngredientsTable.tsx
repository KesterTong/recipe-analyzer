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
import { StatusOr, Nutrients, isOk, hasCode, StatusCode } from "../core";
import { MaybeComponent } from "./MaybeComponent";

function nutrientValue(
  nutrients: StatusOr<Nutrients>,
  id: number,
  numDigits: number
) {
  return isOk(nutrients) ? nutrients[id]?.toFixed(numDigits) : "";
}

export interface StateProps {
  ingredientInfos: {
    description: string;
    nutrients: StatusOr<Nutrients>;
  }[];
  selectedIngredientIndex: number;
  totalNutrients: Nutrients;
  nutrients: { name: string; id: number }[];
  numDigits: number;
}

interface DispatchProps {
  selectIngredient(index: number): void;
}

export const IngredientsTable = MaybeComponent<StateProps, DispatchProps>(
  (props) => (
    <div className="block form-group">
      <table id="ingredients" className="nutrients-table" tabIndex={0}>
        <thead>
          <th>Ingredient</th>
          {props.nutrients.map(({ name }) => (
            <th>{name}</th>
          ))}
        </thead>
        <tbody>
          {props.ingredientInfos.map(({ description, nutrients }, index) => (
            <tr
              className={
                (index == props.selectedIngredientIndex ? "selected-row" : "") +
                (!isOk(nutrients) && !hasCode(nutrients, StatusCode.LOADING)
                  ? " error"
                  : "")
              }
              onClick={() => props.selectIngredient(index)}
            >
              <td>
                <span>
                  {description +
                    "\u200b" /**  zero width space to ensure height is at least one font hieght */}
                </span>
              </td>
              {props.nutrients.map(({ id }) => (
                <td className="nutrient-value">
                  {nutrientValue(nutrients, id, props.numDigits)}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td>Total</td>
            {props.nutrients.map(({ id }) => (
              <td className="nutrient-value">{nutrientValue(props.totalNutrients, id, props.numDigits)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
);
