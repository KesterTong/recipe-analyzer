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
import { SelectedFood } from "../food_input";
import { Food, Nutrients } from "../../core";

export interface State {
  amount: number | null;
  unit: string | null;
  foodId: string | null;
  selected: SelectedFood | null;
  food: Food | null;
  nutrientsPerServing: Nutrients | null;
}

export enum ActionType {
  SELECT_INGREDIENT = "@recipe/SelectIngredient",
  UPDATE_INGREDIENT_AMOUNT = "@recipe/UpdateIngredientAmount",
  UPDATE_INGREDIENT_UNIT = "@recipe/UpdateIngredientUnit",
  UPDATE_INGREDIENT_FOOD = "@recipe/UpdateIngredientFood",
  UPDATE_INGREDIENT_NUTRIENTS_PER_SERVING = "@recipe/UpdateIngredientNutrientsPerServing",
}

export interface SelectIngredient {
  type: ActionType.SELECT_INGREDIENT;
  selected: SelectedFood | null;
}

export interface UpdateIngredientAmount {
  type: ActionType.UPDATE_INGREDIENT_AMOUNT;
  amount: number;
}

export interface UpdateIngredientUnit {
  type: ActionType.UPDATE_INGREDIENT_UNIT;
  unit: string;
}

export interface UpdateIngredientFood {
  type: ActionType.UPDATE_INGREDIENT_FOOD;
  food: Food;
}

export interface UpdateIngredientNutrientsPerServing {
  type: ActionType.UPDATE_INGREDIENT_NUTRIENTS_PER_SERVING;
  nutrientsPerServing: Nutrients;
}

export type Action =
  | SelectIngredient
  | UpdateIngredientAmount
  | UpdateIngredientUnit
  | UpdateIngredientFood
  | UpdateIngredientNutrientsPerServing;
