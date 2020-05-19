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
import { Recipe } from "./Recipe";
import {
  status,
  StatusCode,
  getFdcFoodUrl,
  normalizeFDCFood,
  StatusOr,
} from ".";
import { NormalizedFood, parseFdcWebUrl, FDCFood } from ".";

const FDC_API_KEY = "exH4sAKIf3z3hK5vzw3PJlL9hSbUCLZ2H5feMsVJ";

/**
 * Fetch FDC Foods contained in the recipes in the document.
 *
 * @param document The document
 * @returns The FDC Foods by id
 */
export async function fetchFdcFoods(
  recipes: Recipe[],
  currentFoods?: { [index: number]: StatusOr<NormalizedFood> }
): Promise<{ [index: number]: StatusOr<NormalizedFood> }> {
  const fdcIds: number[] = [];
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach(async (ingredient) => {
      // Links the FDC Web App are parsed as the corresponding food.
      const url = ingredient.ingredient.url;
      const fdcId = url == null ? null : parseFdcWebUrl(url);
      if (fdcId == null) {
        return;
      }
      // Skip foods that have already been loaded.
      if (currentFoods && currentFoods[fdcId]) {
        return;
      }
      fdcIds.push(fdcId);
    });
  });
  const responses = await Promise.all(
    fdcIds.map(async (fdcId) => {
      const response = await fetch(getFdcFoodUrl(fdcId, FDC_API_KEY));
      const json = await response.json();
      if (json.error) {
        return {
          fdcId,
          normalizedFood: status(
            StatusCode.FDC_API_ERROR,
            "Error fetching FDC food: " + fdcId
          ),
        };
      }
      const normalizedFood = normalizeFDCFood(json);
      return { fdcId, normalizedFood };
    })
  );
  let result: { [index: number]: StatusOr<NormalizedFood> } = {};
  responses.forEach((response) => {
    result[response.fdcId] = response.normalizedFood;
  });
  return result;
}
