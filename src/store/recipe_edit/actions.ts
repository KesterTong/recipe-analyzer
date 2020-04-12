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
import {
  Action as IngredientAction,
  ActionType as IngredientActionType,
} from "../ingredient";
import { Action, ActionType } from "./types";

export function updateDescription(description: string): Action {
  return { type: ActionType.UPDATE_DESCRIPTION, description };
}

export function addIngredient(): Action {
  return { type: ActionType.ADD_INGREDIENT };
}

export function deleteIngredient(index: number): Action {
  return { type: ActionType.DELETE_INGREDIENT, index };
}

function updateIngredient(index: number, action: IngredientAction): Action {
  return { type: ActionType.UPDATE_INGREDIENT, index, action };
}

export function selectIngredient(
  index: number,
  selected: SelectedFood | null
): Action {
  return updateIngredient(index, {
    type: IngredientActionType.SELECT_INGREDIENT,
    selected,
  });
}

export function updateIngredientAmount(index: number, amount: number): Action {
  return updateIngredient(index, {
    type: IngredientActionType.UPDATE_INGREDIENT_AMOUNT,
    amount,
  });
}

export function updateIngredientUnit(index: number, unit: string): Action {
  return updateIngredient(index, {
    type: IngredientActionType.UPDATE_INGREDIENT_UNIT,
    unit,
  });
}

export function updateIngredientFood(index: number, food: Food): Action {
  return updateIngredient(index, {
    type: IngredientActionType.UPDATE_INGREDIENT_FOOD,
    food,
  });
}

export function updateIngredientNutrientsPerServing(
  index: number,
  nutrientsPerServing: Nutrients
): Action {
  return updateIngredient(index, {
    type: IngredientActionType.UPDATE_INGREDIENT_NUTRIENTS_PER_SERVING,
    nutrientsPerServing,
  });
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
    dispatch(updateIngredientFood(index, food));
    const nutrientsPerServing = await nutrientsPerServingForFood(
      food,
      getFood,
      getState().config.nutrientInfos.map((nutrientInfo) => nutrientInfo.id)
    );
    dispatch(updateIngredientNutrientsPerServing(index, nutrientsPerServing));
  };
}

export function selectAndMaybeLoadIngredient(
  index: number,
  selected: SelectedFood | null
): ThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    dispatch(selectIngredient(index, selected));
    if (selected === null) {
      return;
    }
    const food = await getFood(selected.foodId);
    dispatch(updateIngredientFood(index, food));
    const nutrientsPerServing = await nutrientsPerServingForFood(
      food,
      getFood,
      getState().config.nutrientInfos.map((nutrientInfo) => nutrientInfo.id)
    );
    dispatch(updateIngredientNutrientsPerServing(index, nutrientsPerServing));
  };
}
