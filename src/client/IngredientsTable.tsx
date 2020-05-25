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
  FoodReference,
} from "../core";
import { MaybeComponent } from "./MaybeComponent";
import { Config } from "../config/config";

export interface StateProps {
  recipeIndexByUrl: { [index: string]: number };
  ingredientInfos: {
    ingredient: Ingredient;
    nutrients: StatusOr<Nutrients>;
  }[];
  selectedIngredientIndex: number;
  totalNutrients: Nutrients;
  config: Config;
}

interface DispatchProps {
  selectRecipe(index: number): void;
  selectIngredient(index: number): void;
}

const NutrientsColumnHeaders: React.FunctionComponent<{ config: Config }> = (
  props
) => {
  return (
    <React.Fragment>
      {props.config.nutrients.map(({ name }) => (
        <th>{name}</th>
      ))}
    </React.Fragment>
  );
};

const IngredientLink: React.FunctionComponent<{
  link: FoodReference;
  recipeIndexByUrl: { [index: string]: number };
  selectRecipe: (index: number) => void;
}> = (props) => {
  const { description, url } = props.link;
  if (url === null) {
    return <React.Fragment>{description}</React.Fragment>;
  } else if (props.recipeIndexByUrl[url] !== undefined) {
    return (
      <a
        href="#"
        onClick={(event) => {
          props.selectRecipe(props.recipeIndexByUrl[url]);
          event.preventDefault();
        }}
      >
        {description}
      </a>
    );
  } else {
    return (
      <a href={url} target="_blank">
        {description}
      </a>
    );
  }
};

const NutrientsRowCells: React.FunctionComponent<{
  nutrients: StatusOr<Nutrients>;
  config: Config;
}> = (props) => {
  return (
    <React.Fragment>
      {props.config.nutrients.map(({ id }) => {
        let displayValue = "";
        if (isOk(props.nutrients) && props.nutrients[id] !== undefined) {
          displayValue = props.nutrients[id].toFixed(props.config.numDigits);
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
          <NutrientsColumnHeaders config={props.config} />
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
                    " \u200b" /**  zero width space to ensure height is at least one font hieght */}
                  <IngredientLink
                    link={ingredient.ingredient}
                    recipeIndexByUrl={props.recipeIndexByUrl}
                    selectRecipe={props.selectRecipe}
                  />
                </span>
              </td>
              <NutrientsRowCells nutrients={nutrients} config={props.config} />
            </tr>
          ))}
          <tr>
            <td>Total</td>
            <NutrientsRowCells
              nutrients={props.totalNutrients}
              config={props.config}
            />
          </tr>
        </tbody>
      </table>
    </div>
  )
);
