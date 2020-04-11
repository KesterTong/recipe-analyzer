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
import { nutrientsPerServingForFood, Food, Nutrients } from "../../core";
import { getFood } from "../../database";
import { RootAction } from "../types";
import { ActionType } from "./types";
import { ThunkResult } from "../types";
import { SelectedFood } from "../food_input";

export function updateDescription(description: string): RootAction {
  return { type: ActionType.UPDATE_DESCRIPTION, description };
}

export function addIngredient(): RootAction {
  return { type: ActionType.ADD_INGREDIENT };
}

export function deleteIngredient(index: number): RootAction {
  return { type: ActionType.DELETE_INGREDIENT, index };
}

export function selectIngredient(
  index: number,
  foodId: string,
  food: Food,
  nutrientsPerServing: Nutrients
): RootAction {
  return {
    type: ActionType.SELECT_INGREDIENT,
    index,
    foodId,
    food,
    nutrientsPerServing,
  };
}

export function deselectIngredient(index: number): RootAction {
  return { type: ActionType.DESELECT_INGREDIENT, index };
}

export function updateIngredientAmount(
  index: number,
  amount: number
): RootAction {
  return {
    type: ActionType.UPDATE_INGREDIENT_AMOUNT,
    index,
    amount,
  };
}

export function updateIngredientUnit(index: number, unit: string): RootAction {
  return {
    type: ActionType.UPDATE_INGREDIENT_UNIT,
    index,
    unit,
  };
}

export function updateIngredientFood(
  index: number,
  food: Food,
  nutrientsPerServing: Nutrients
): RootAction {
  return {
    type: ActionType.UPDATE_INGREDIENT_FOOD,
    index,
    food,
    nutrientsPerServing,
  };
}

export function loadIngredient(
  index: number,
  foodId: string
): ThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const food = await getFood(foodId);
    const nutrientsPerServing = food
      ? await nutrientsPerServingForFood(
          food,
          getFood,
          getState().config.nutrientInfos.map((nutrientInfo) => nutrientInfo.id)
        )
      : null;
    if (nutrientsPerServing != null) {
      dispatch(updateIngredientFood(index, food, nutrientsPerServing));
    }
  };
}

export function loadAndMaybeSelectIngredient(
  index: number,
  selected: SelectedFood | null
): ThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    if (selected === null) {
      dispatch(deselectIngredient(index));
      return;
    }
    const food = await getFood(selected.foodId);
    const nutrientsPerServing = await nutrientsPerServingForFood(
      food,
      getFood,
      getState().config.nutrientInfos.map((nutrientInfo) => nutrientInfo.id)
    );
    dispatch(
      selectIngredient(index, selected.foodId, food, nutrientsPerServing)
    );
  };
}
