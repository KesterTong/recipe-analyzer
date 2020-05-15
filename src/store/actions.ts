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
import { RootAction, ActionType } from "./types";
import { Recipe } from "../document/Document";
import { NormalizedFood } from "../core";

export function initialize(
  recipes: Recipe[],
  fdcFoodsById: {
    [index: number]: NormalizedFood;
  }
): RootAction {
  return {
    type: ActionType.INITIALIZE,
    recipes,
    fdcFoodsById,
  };
}

export function setError(message: string): RootAction {
  return { type: ActionType.SET_ERROR, message };
}

export function selectRecipe(index: number): RootAction {
  return {
    type: ActionType.SELECT_RECIPE,
    index,
  };
}

export function selectIngredient(index: number): RootAction {
  return {
    type: ActionType.SELECT_INGREDIENT,
    index,
  };
}
