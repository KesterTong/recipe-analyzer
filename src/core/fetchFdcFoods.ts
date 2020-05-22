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
import { Food, parseFdcWebUrl, FDCFood } from ".";
import { ConversionData } from "./canonicalizeQuantity";

const FDC_API_KEY = "exH4sAKIf3z3hK5vzw3PJlL9hSbUCLZ2H5feMsVJ";

export async function fetchFdcFood(
  fdcId: number,
  conversionData: ConversionData
): Promise<StatusOr<Food>> {
  const response = await fetch(getFdcFoodUrl(fdcId, FDC_API_KEY));
  const json = await response.json();
  if (json.error) {
    return status(
      StatusCode.FDC_API_ERROR,
      "Error fetching FDC food: " + fdcId
    );
  }
  return normalizeFDCFood(json, conversionData);
}

/**
 * Fetch FDC Foods contained in the recipes in the document.
 *
 * @param document The document
 * @returns The FDC Foods by id
 */
export async function fetchFdcFoods(
  recipes: Recipe[],
  conversionData: ConversionData
): Promise<{ [index: string]: StatusOr<Food> }> {
  const fdcIds: number[] = [];
  const urls: string[] = [];
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach(async (ingredient) => {
      // Links the FDC Web App are parsed as the corresponding food.
      const url = ingredient.ingredient.url;
      if (url == null) {
        return;
      }
      const fdcId = parseFdcWebUrl(url);
      if (fdcId == null) {
        return;
      }
      fdcIds.push(fdcId);
      urls.push(url);
    });
  });
  const responses = await Promise.all(
    fdcIds.map((food) => fetchFdcFood(food, conversionData))
  );
  let result: { [index: string]: StatusOr<Food> } = {};
  responses.forEach((response, index) => {
    result[urls[index]] = response;
  });
  return result;
}
