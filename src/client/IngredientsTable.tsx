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
import {
  StatusOr,
  Nutrients,
  isOk,
  hasCode,
  StatusCode,
  Ingredient,
} from "../core";
import { MaybeComponent } from "./MaybeComponent";

export interface StateProps {
  ingredientInfos: {
    ingredient: Ingredient;
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

const NutrientsColumnHeaders: React.FunctionComponent<{
  nutrients: { name: string; id: number }[];
}> = (props) => {
  return (
    <React.Fragment>
      {props.nutrients.map(({ name }) => (
        <th>{name}</th>
      ))}
    </React.Fragment>
  );
};

const NutrientsRowCells: React.FunctionComponent<{
  nutrientDefs: { name: string; id: number }[];
  nutrients: StatusOr<Nutrients>;
  numDigits: number;
}> = (props) => {
  return (
    <React.Fragment>
      {props.nutrientDefs.map(({ id }) => {
        let displayValue = "";
        if (isOk(props.nutrients) && props.nutrients[id] !== undefined) {
          displayValue = props.nutrients[id].toFixed(props.numDigits);
        }
        return <td className="nutrient-value">{displayValue}</td>;
      })}
    </React.Fragment>
  );
};

export const IngredientsTable = MaybeComponent<StateProps, DispatchProps>(
  (props) => (
    <div className="block form-group">
      <table id="ingredients" className="nutrients-table" tabIndex={0}>
        <thead>
          <th>Ingredient</th>
          <NutrientsColumnHeaders nutrients={props.nutrients} />
        </thead>
        <tbody>
          {props.ingredientInfos.map(({ ingredient, nutrients }, index) => (
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
                  {ingredient.amount +
                    " " +
                    ingredient.unit +
                    " " +
                    ingredient.ingredient.description +
                    "\u200b" /**  zero width space to ensure height is at least one font hieght */}
                </span>
              </td>
              <NutrientsRowCells
                nutrientDefs={props.nutrients}
                nutrients={nutrients}
                numDigits={props.numDigits}
              />
            </tr>
          ))}
          <tr>
            <td>Total</td>
            <NutrientsRowCells
              nutrientDefs={props.nutrients}
              nutrients={props.totalNutrients}
              numDigits={props.numDigits}
            />
          </tr>
        </tbody>
      </table>
    </div>
  )
);
