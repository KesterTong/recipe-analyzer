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

import { ThunkAction } from "redux-thunk";
import { RootState } from "./RootState";
import { RootAction, ActionType } from "./RootAction";
import { parseDocument, updateDocument as updateServerDocument } from "./doc";
import {
  fetchFdcFoods,
  Update,
  UpdateType,
  Recipe,
  parseFdcWebUrl,
  initializeQuantityData,
  makeFdcWebUrl,
  isOk,
} from "../core";
import { fetchFdcFood } from "../core/fetchFdcFoods";
import { defaultConfig } from "./config";

export type ThunkResult<R> = ThunkAction<R, RootState, undefined, RootAction>;

export function initialize(): ThunkResult<void> {
  return async (dispatch) => {
    try {
      const recipes = await parseDocument();
      const conversionData = initializeQuantityData(
        defaultConfig.massUnits,
        defaultConfig.volumeUnits
      );
      const normalizedFoodsByUrl = await fetchFdcFoods(recipes, conversionData);
      dispatch({
        type: ActionType.INITIALIZE,
        recipes,
        normalizedFoodsByUrl,
        config: defaultConfig,
        conversionData,
      });
    } catch (error) {
      dispatch({
        type: ActionType.INITIALIZATION_ERROR,
        message: error.message,
      });
    }
  };
}

const UPC_REGEX = /\d{12,13}/;

function maybeRewrite(update: Update): ThunkResult<void> {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.type !== "Active") {
      return;
    }
    if (update.type != UpdateType.UPDATE_INGREDIENT) {
      return;
    }
    if (update.newFood === undefined) {
      return;
    }
    if (update.newFood.url !== null) {
      return;
    }
    const fdcId = parseFdcWebUrl(update.newFood.description);
    if (fdcId === null) {
      return;
    }
    const normalizedFood = await fetchFdcFood(fdcId, state.conversionData);
    // TODO: handle errors.
    dispatch(
      updateDocument({
        ...update,
        newFood: {
          description: isOk(normalizedFood)
            ? normalizedFood.description
            : "ERROR",
          url: makeFdcWebUrl(fdcId),
        },
      })
    );
  };
}

export function updateDocument(update: Update): ThunkResult<void> {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.type != "Active") {
      return;
    }

    // Rewrite ingredient food updates so that users can type in
    // or copy-paste a URL or UPC, and it will get rewritten to
    // a link.  This is done asynchronously.
    dispatch(maybeRewrite(update));

    // We update the document on the server side asynchronously.
    updateServerDocument(update);

    dispatch({
      type: ActionType.UPDATE_RECIPES,
      update,
    });

    // Load any ingredients that need loading
    if (
      update.type == UpdateType.UPDATE_INGREDIENT &&
      update.newFood &&
      update.newFood.url
    ) {
      const fdcId = parseFdcWebUrl(update.newFood.url);
      if (fdcId !== null) {
        const newFdcFood = await fetchFdcFood(fdcId, state.conversionData);
        dispatch({
          type: ActionType.UPDATE_FDC_FOODS,
          normalizedFoodsByUrl: { [update.newFood.url]: newFdcFood },
        });
      }
    }
  };
}

export function selectRecipe(index: number): RootAction {
  return { type: ActionType.SELECT_RECIPE, index };
}

export function selectIngredient(index: number): RootAction {
  return { type: ActionType.SELECT_INGREDIENT, index };
}
