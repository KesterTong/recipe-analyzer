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
import {
  parseDocument,
  updateDocument as updateServerDocument,
  selectRecipe as selectServerRecipe,
  getConfig,
} from "./doc";
import {
  Update,
  UpdateType,
  initializeQuantityData,
  isOk,
  StatusOr,
  status,
  Food,
  StatusCode,
} from "../core";
import { fetchFdcFood } from "../food_data_central";

export type ThunkResult<R> = ThunkAction<R, RootState, undefined, RootAction>;

export function initialize(): ThunkResult<void> {
  return async (dispatch) => {
    try {
      const recipes = await parseDocument();
      const config = await getConfig();
      const conversionData = initializeQuantityData(
        config.massUnits,
        config.volumeUnits
      );
      const urls: string[] = [];
      recipes.forEach((recipe) => {
        recipe.ingredients.forEach(async (ingredient) => {
          // Links the FDC Web App are parsed as the corresponding food.
          const url = ingredient.ingredient.url;
          if (url == null || url.startsWith("#")) {
            return;
          }
          urls.push(url);
        });
      });
      const responses = await Promise.all(
        urls.map((url) => fetchFdcFood(url, config.fdcApiKey, conversionData))
      );
      let normalizedFoodsByUrl: { [index: string]: StatusOr<Food> } = {};
      responses.forEach((response, index) => {
        normalizedFoodsByUrl[urls[index]] = response;
      });
      dispatch({
        type: ActionType.INITIALIZE,
        recipes,
        normalizedFoodsByUrl,
        config,
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

function maybeRewrite(update: Update): ThunkResult<void> {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.type != "Active") {
      return;
    }
    if (
      !(
        update.type == UpdateType.UPDATE_INGREDIENT &&
        update.newFood &&
        update.newFood.url === null &&
        update.newFood.description.startsWith("https://")
      )
    ) {
      return;
    }
    const url = update.newFood.description;
    const normalizedFood = await fetchFdcFood(
      url,
      state.config.fdcApiKey,
      state.conversionData
    );
    // TODO: handle errors.
    dispatch(
      updateDocument({
        ...update,
        newFood: {
          description: isOk(normalizedFood)
            ? normalizedFood.description
            : "broken link",
          url,
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

    // Load any ingredients that need loading
    if (
      update.type == UpdateType.UPDATE_INGREDIENT &&
      update.newFood &&
      update.newFood.url &&
      !update.newFood.url.startsWith("#")
    ) {
      const newFoodUrl = update.newFood.url;
      dispatch({
        type: ActionType.UPDATE_FDC_FOODS,
        normalizedFoodsByUrl: {
          [newFoodUrl]: status(StatusCode.LOADING, "Loading"),
        },
      });
      fetchFdcFood(
        update.newFood.url,
        state.config.fdcApiKey,
        state.conversionData
      ).then((newFdcFood) =>
        dispatch({
          type: ActionType.UPDATE_FDC_FOODS,
          normalizedFoodsByUrl: { [newFoodUrl]: newFdcFood },
        })
      );
    }

    dispatch({
      type: ActionType.UPDATE_RECIPES,
      update,
    });
  };
}

export function selectRecipe(index: number): ThunkResult<void> {
  return (dispatch) => {
    // Select the recipe in the Google Doc too.
    selectServerRecipe(index);
    dispatch({ type: ActionType.SELECT_RECIPE, index });
  };
}

export function selectIngredient(index: number): RootAction {
  return { type: ActionType.SELECT_INGREDIENT, index };
}
