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
import { ThunkResult } from "../types";
import { SelectedFood } from "../food_input";
import { Action as IngredientAction } from "../ingredient";
import { Action, ActionType } from "./types";
import {
  updateFood,
  updateNutrientsPerServing,
  selectIngredient,
} from "../ingredient/actions";

export function updateDescription(description: string): Action {
  return { type: ActionType.UPDATE_DESCRIPTION, description };
}

export function addIngredient(): Action {
  return { type: ActionType.ADD_INGREDIENT };
}

export function deleteIngredient(index: number): Action {
  return { type: ActionType.DELETE_INGREDIENT, index };
}

export function updateIngredient(
  index: number,
  action: IngredientAction
): Action {
  return { type: ActionType.UPDATE_INGREDIENT, index, action };
}

export function loadIngredient(
  index: number,
  foodId: string
): ThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const food = await getFood(foodId);
    if (food == null) {
      return;
    }
    dispatch(updateIngredient(index, updateFood(food)));
    const nutrientsPerServing = await nutrientsPerServingForFood(
      food,
      getFood,
      getState().config.nutrientInfos.map((nutrientInfo) => nutrientInfo.id)
    );
    dispatch(
      updateIngredient(index, updateNutrientsPerServing(nutrientsPerServing))
    );
  };
}

export function selectAndMaybeLoadIngredient(
  index: number,
  selected: SelectedFood | null
): ThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    dispatch(updateIngredient(index, selectIngredient(selected)));
    if (selected === null) {
      return;
    }
    const food = await getFood(selected.foodId);
    dispatch(updateIngredient(index, updateFood(food)));
    const nutrientsPerServing = await nutrientsPerServingForFood(
      food,
      getFood,
      getState().config.nutrientInfos.map((nutrientInfo) => nutrientInfo.id)
    );
    dispatch(
      updateIngredient(index, updateNutrientsPerServing(nutrientsPerServing))
    );
  };
}
