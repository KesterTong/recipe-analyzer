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

import { Quantity } from "./core/Quantity";
import { Nutrients } from "./core/Nutrients";
import { parseQuantity } from './core/parseQuantity';

export interface ParsedIngredient {
  quantity: Quantity;
  id: {fdcId: string, bookmarkId: string};
}

/**
 * Parse an ingredient with quantitiy, e.g. "1 cup flour"
 */
export function parseIngredient(textElement: GoogleAppsScript.Document.Text): ParsedIngredient {
  let linkUrl = null;
  let ingredientStart = 0;
  let text = textElement.getText();
  let textLength = text.length;
  while(ingredientStart < textLength && (linkUrl = textElement.getLinkUrl(ingredientStart)) == null) {
    ingredientStart++;
  }
  if (linkUrl == null) {
    return null;
  }
  let quantity = parseQuantity(text.substr(0, ingredientStart));
  if (quantity == null) {
    return null;
  }
  let fdcIdMatch = linkUrl.match('^https://(?:[^/]*)(?:[^\\d]*)(\\d*)');
  let fdcId = fdcIdMatch ? fdcIdMatch[1] : null;
  let bookmarkIdMatch = linkUrl.match('^#bookmark=(.*)');
  let bookmarkId = bookmarkIdMatch ? bookmarkIdMatch[1] : null;
  if (!(fdcId || bookmarkId)) {
    return null;
  }
  return {
    quantity: quantity,
    id: {bookmarkId: bookmarkId, fdcId: fdcId},
  };
}

export function updateIngredient(textElement: GoogleAppsScript.Document.Text, nutrients: Nutrients) {
  let displayNutrients: string;
  if (nutrients == null) {
    // Display '-' to indicate that no nutrient value could be computed.
    displayNutrients = '\t-\t-';
    nutrients = {};
  } else {
    displayNutrients = '\t' + nutrients.calories.toFixed(0) + '\t' + nutrients.protein.toFixed(0);
  }
  // Truncate to end of link and add nutrient info.  Appending text will extend the link
  // if the current text ends with a link, so we explicitly set the link url to null for
  // the appended text.
  textElement.replaceText('\\t.*$', '');
  var originalSize = textElement.getText().length;
  textElement.appendText(displayNutrients);
  textElement.setLinkUrl(originalSize, originalSize + displayNutrients.length - 1, null);
}
