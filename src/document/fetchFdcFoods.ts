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
import { Document } from "./Document";
import { Status, StatusCode, getFdcFoodUrl } from "../core";
import { NormalizedFood, parseFdcWebUrl } from "../core";

const FDC_API_KEY = 'exH4sAKIf3z3hK5vzw3PJlL9hSbUCLZ2H5feMsVJ';

/**
 * Fetch FDC Foods contained in the recipes in the document.
 * 
 * @param document The document
 * @returns The FDC Foods by id
 */
export function fetchFdcFoods(document: Document): Promise<{[index: string]: NormalizedFood}> {
  const fdcIds: number[] = [];
  document.recipes.forEach(recipe => {
    recipe.ingredients.forEach(async ingredient => {
      // Links the FDC Web App are parsed as the corresponding food.
      const url = ingredient.ingredient.url;
      const fdcId = url == null ? null : parseFdcWebUrl(url);
      if (fdcId == null) {
        return;
      }
      fdcIds.push(fdcId);
    })
  });
}