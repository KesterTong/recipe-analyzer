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
  SELECT_FOOD = "@recipe/SelectFood",
  UPDATE_AMOUNT = "@recipe/UpdateAmount",
  UPDATE_UNIT = "@recipe/UpdateUnit",
  UPDATE_FOOD = "@recipe/UpdateFood",
  UPDATE_NUTRIENTS_PER_SERVING = "@recipe/UpdateNutrientsPerServing",
}

export interface SelectFood {
  type: ActionType.SELECT_FOOD;
  selected: SelectedFood | null;
}

export interface UpdateAmount {
  type: ActionType.UPDATE_AMOUNT;
  amount: number;
}

export interface UpdateUnit {
  type: ActionType.UPDATE_UNIT;
  unit: string;
}

export interface UpdateFood {
  type: ActionType.UPDATE_FOOD;
  food: Food;
}

export interface UpdateNutrientsPerServing {
  type: ActionType.UPDATE_NUTRIENTS_PER_SERVING;
  nutrientsPerServing: Nutrients;
}

export type Action =
  | SelectFood
  | UpdateAmount
  | UpdateUnit
  | UpdateFood
  | UpdateNutrientsPerServing;
