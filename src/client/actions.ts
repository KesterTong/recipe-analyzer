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
  isOk,
  StatusOr,
  status,
  Food,
  StatusCode,
  DataSource,
  FoodReference,
} from "../core";
import { dataSource as fdcDataSource } from "../food_data_central";
import { dataSource as offDataSource } from "../open_food_facts";
import { Config } from "../config/config";
import { ThunkDispatch } from "./store";
import { filterNulls } from "../core/filterNulls";

export type ThunkResult<R> = ThunkAction<R, RootState, undefined, RootAction>;

const dataSources: DataSource<Config>[] = [fdcDataSource, offDataSource];

/**
 * Load a food if it hasn't been loaded already, and return it.
 *
 * @param url The URL of the food to load
 */
function loadFood(url: string): ThunkResult<Promise<StatusOr<Food>>> {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.type != "Active") {
      throw new Error("loadFood called before initialization");
    }
    if (state.normalizedFoodsByUrl[url] !== undefined) {
      return state.normalizedFoodsByUrl[url];
    }

    let pendingFood: Promise<StatusOr<Food>> | null = null;
    dataSources.forEach((dataSource) => {
      if (pendingFood === null) {
        pendingFood = dataSource.fetchFood(url, state.config);
      }
    });
    if (pendingFood === null) {
      pendingFood = Promise.resolve(
        status(StatusCode.FOOD_NOT_FOUND, "Unrecognized URL " + url)
      );
    }
    dispatch({
      type: ActionType.UPDATE_FDC_FOODS,
      normalizedFoodsByUrl: {
        [url]: status(StatusCode.LOADING, "Loading"),
      },
    });
    const food = await pendingFood;
    dispatch({
      type: ActionType.UPDATE_FDC_FOODS,
      normalizedFoodsByUrl: {
        [url]: food,
      },
    });
    return food;
  };
}

export function searchFoods(
  query: string
): ThunkResult<Promise<FoodReference[]>> {
  return async (_, getState) => {
    const state = getState();
    if (state.type != "Active") {
      throw new Error("Cannot fetch results while state is not Active");
    }
    const queryLower = query.toLocaleLowerCase();
    const localSuggestions: FoodReference[] = state.recipes
      .filter((_, index) => index != state.selectedRecipeIndex)
      .map((recipe) => ({
        description: recipe.title,
        url: recipe.url,
      }))
      .concat(
        filterNulls(
          Object.entries(state.normalizedFoodsByUrl).map(
            ([url, normalizedFood]) =>
              isOk(normalizedFood)
                ? {
                    url,
                    description: normalizedFood.description,
                  }
                : null
          )
        )
      )
      .filter((suggestion) =>
        suggestion.description.toLocaleLowerCase().includes(queryLower)
      );
    if (query.length < state.config.minCharsToQueryFDC) {
      return [];
    }
    const remoteSuggestions = await dataSources[0].searchFoods(
      query,
      state.config
    );
    return localSuggestions.concat(remoteSuggestions);
  };
}

export function initialize(): ThunkResult<void> {
  return async (dispatch) => {
    try {
      const recipes = await parseDocument();
      const config = await getConfig();
      dispatch({
        type: ActionType.INITIALIZE,
        recipes,
        config,
      });
      // Load all ingredients for all recipes.
      recipes.forEach((recipe) => {
        recipe.ingredients.forEach((ingredient) => {
          const url = ingredient.ingredient.url;
          if (url === null || url.startsWith("#")) {
            return;
          }
          dispatch(loadFood(url));
        });
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
    // Don't try to rewrite if the ingredient has a link already.
    if (
      update.type != UpdateType.UPDATE_INGREDIENT ||
      update.newFood === undefined ||
      update.newFood.url !== null
    ) {
      return;
    }
    const description = update.newFood.description;
    let url: string | null = null;
    dataSources.forEach((dataSource) => {
      if (url == null) {
        url = dataSource.maybeUrlFromDescription(description);
      }
    });
    if (url === null) {
      return;
    }
    const normalizedFood = await dispatch(loadFood(url));
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
      dispatch(loadFood(update.newFood.url));
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
