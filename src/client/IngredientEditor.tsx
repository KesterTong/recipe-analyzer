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
import { Ingredient, StatusOr, Nutrients, UpdateType, Update } from "../core";
import { FoodInput } from "./FoodInput";
import { MaybeComponent } from "./MaybeComponent";

export interface StateProps {
  ingredient: Ingredient;
  amountError: string | null;
  unitError: string | null;
  foodError: string | null;
  nutrients: StatusOr<Nutrients>;
  updateContext: {
    type: UpdateType.UPDATE_INGREDIENT;
    recipeIndex: number;
    ingredientIndex: number;
  };
  suggestions: { description: string; url: string }[];
}

interface DispatchProps {
  updateDocument(update: Update): void;
}

export const IngredientEditor = MaybeComponent<StateProps, DispatchProps>(
  (props) => (
    <React.Fragment>
      <div className="block form-group">
        <label htmlFor="ingredient-amount">Amount</label>
        <div className="control-group">
          <input
            type="text"
            id="ingredient-amount"
            value={props.ingredient.amount}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              props.updateDocument({
                ...props.updateContext,
                newAmount: event.target.value,
              })
            }
          ></input>
        </div>
        <div className="error">{props.amountError}</div>
      </div>
      <div className="block form-group">
        <label htmlFor="ingredient-unit">Unit</label>
        <div className="control-group">
          <input
            type="text"
            id="ingredient-unit"
            value={props.ingredient.unit}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              props.updateDocument({
                ...props.updateContext,
                newUnit: event.target.value,
              })
            }
          ></input>
        </div>
        <div className="error">{props.unitError}</div>
      </div>
      <div className="block form-group">
        <label htmlFor="ingredient-food">Food</label>
        <FoodInput
          id="ingredient-food"
          value={props.ingredient.ingredient}
          suggestions={props.suggestions}
          onChange={(value) =>
            props.updateDocument({
              ...props.updateContext,
              newFood: value,
            })
          }
        />
        <div className="error">{props.foodError}</div>
      </div>
    </React.Fragment>
  )
);
