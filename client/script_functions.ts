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

/**
 * Functions that can be called from the HTML UI (client).
 * 
 * These functions provide access to the Google Doc and also Firebase and 
 * Web functions that are accesssed via the Apps Script server code.
 * 
 * For convenience we expose these as promises.
 */

import { IngredientIdentifier, FoodRef } from "../core/FoodRef";
import { Food } from "../core/Food";
import { NormalizedFood } from "../core/NormalizedFood";
const google = (<any>window)['google'];

function wrapAsPromise<T>(funcName: string, args: any[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    google.script.run
    .withSuccessHandler(resolve)
    .withFailureHandler(reject)
    [funcName]
    .apply(null, args);
  });
}

export function getSearchResults(query: string): Promise<FoodRef[]> {
  return wrapAsPromise('getSearchResultsImpl', [query]);
}

export function showCustomIngredientSidebar(bookmarkId: string): Promise<void> {
  return wrapAsPromise('showCustomIngredientSidebarImpl', [bookmarkId]);
}

export function getFoodDetails(ingredientIdentifier: IngredientIdentifier): Promise<Food | null> {
  return wrapAsPromise('getFoodDetailsImpl', [ingredientIdentifier]);
}

export function patchFood(ingredientIdentifier: IngredientIdentifier, food: Food): Promise<void> {
  return wrapAsPromise('patchFoodImpl', [ingredientIdentifier, food]);
}

export function getNormalizedFoodDetails(ingredientIdentifier: IngredientIdentifier): Promise<NormalizedFood | null> {
  return wrapAsPromise('getNormalizedFoodDetailsImpl', [ingredientIdentifier]);
}

export function moveCursorToBookmark(bookmarkId: string): Promise<void> {  
  return wrapAsPromise('moveCursorToBookmarkImpl', [bookmarkId]);
}

export function addIngredient(ingredientIdentifier: IngredientIdentifier, amount: number, unit: string, description: string): Promise<void> {
  return wrapAsPromise('addIngredientImpl', [ingredientIdentifier, amount, unit, description]);
}

export function getNutrientNames(): Promise<{id: number, name: string}[]> {
  return wrapAsPromise('getNutrientNamesImpl', []);
}