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
  Update,
  UpdateType,
} from "../core";
import { MaybeComponent } from "./MaybeComponent";
import { Config } from "../config/config";

export interface StateProps {
  selectedRecipeIndex: number;
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
  updateDocument(update: Update): void;
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
  (props) => {
    const [menu, setMenu] = React.useState<{ x: number; y: number } | null>(
      null
    );

    const handleContextMenuSelection = (
      event: React.ChangeEvent<HTMLSelectElement>
    ) => {
      switch (event.target.value) {
        case "insert-above":
          props.updateDocument({
            type: UpdateType.INSERT_INGREDIENT,
            recipeIndex: props.selectedRecipeIndex,
            atIndex: props.selectedIngredientIndex,
          });
          break;
        case "insert-below":
          props.updateDocument({
            type: UpdateType.INSERT_INGREDIENT,
            recipeIndex: props.selectedRecipeIndex,
            atIndex: props.selectedIngredientIndex + 1,
          });
          break;
        case "delete":
          // If there is only one ingredient, clear it instead of delete.
          // This ensure that each recipe has at least one ingredient.
          if (props.ingredientInfos.length === 1) {
            props.updateDocument({
              type: UpdateType.UPDATE_INGREDIENT,
              recipeIndex: props.selectedIngredientIndex,
              ingredientIndex: props.selectedIngredientIndex,
              newAmount: "",
              newUnit: "",
              newFood: { description: "", url: null },
            });
          } else {
            props.updateDocument({
              type: UpdateType.DELETE_INGREDIENT,
              recipeIndex: props.selectedRecipeIndex,
              ingredientIndex: props.selectedIngredientIndex,
            });
          }
          break;
        case "move-up":
          props.updateDocument({
            type: UpdateType.SWAP_INGREDIENTS,
            recipeIndex: props.selectedRecipeIndex,
            firstIngredientIndex: props.selectedIngredientIndex - 1,
          });
          break;
        case "move-down":
          props.updateDocument({
            type: UpdateType.SWAP_INGREDIENTS,
            recipeIndex: props.selectedRecipeIndex,
            firstIngredientIndex: props.selectedIngredientIndex,
          });
          break;
      }
      setMenu(null);
    };
    return (
      <div className="block form-group">
        {menu ? (
          <div className="context-menu" style={{ left: menu.x, top: menu.y }}>
            <select
              size={4}
              style={{ border: "none" }}
              onChange={handleContextMenuSelection}
            >
              <option value="insert-above">Insert above</option>
              <option value="insert-below">Insert below</option>
              <option value="delete">Delete</option>
              <option
                value="move-up"
                disabled={props.selectedIngredientIndex == 0}
              >
                Move up
              </option>
              <option
                value="move-down"
                disabled={
                  props.selectedIngredientIndex ==
                  props.ingredientInfos.length - 1
                }
              >
                Move down
              </option>
            </select>
          </div>
        ) : null}
        <table
          id="ingredients"
          className="nutrients-table"
          tabIndex={0}
          onClick={() => setMenu(null)}
        >
          <thead>
            <th>Ingredient</th>
            <NutrientsColumnHeaders config={props.config} />
          </thead>
          <tbody>
            {props.ingredientInfos.map(({ ingredient, nutrients }, index) => (
              <tr
                className={
                  (index == props.selectedIngredientIndex
                    ? "selected-row"
                    : "") +
                  (!isOk(nutrients) && !hasCode(nutrients, StatusCode.LOADING)
                    ? " error"
                    : "")
                }
                onClick={() => props.selectIngredient(index)}
                onContextMenu={(event) => {
                  setMenu({
                    x: event.clientX,
                    y: event.clientY,
                  });
                  props.selectIngredient(index);
                  event.preventDefault();
                }}
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
                <NutrientsRowCells
                  nutrients={nutrients}
                  config={props.config}
                />
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
    );
  }
);
