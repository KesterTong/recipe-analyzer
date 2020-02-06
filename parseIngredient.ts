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
import { FoodIdentifier } from "./core/FoodIdentifier";

export interface ParsedIngredient {
  quantity: Quantity;
  id: FoodIdentifier;
}

/**
 * Parse an ingredient with quantitiy, e.g. "1 cup flour"
 */
export function parseIngredient(textElement: GoogleAppsScript.Document.Text): ParsedIngredient | null {
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
  let bookmarkIdMatch = linkUrl.match('^#bookmark=(.*)');
  let id: FoodIdentifier;
  if (fdcIdMatch) {
    id = {foodType: 'FDC Food', fdcId: Number(fdcIdMatch[1])};
  } else if (bookmarkIdMatch) {
    id = {foodType: 'Local Food', bookmarkId: bookmarkIdMatch[1]}
  } else {
    return null;
  }
  return {
    quantity: quantity,
    id: id,
  };
}

export function updateIngredient(textElement: GoogleAppsScript.Document.Text, nutrients: Nutrients | null, nutrientsToDisplay: number[]) {
  let displayNutrients: string;
  if (nutrients == null) {
    // Display '-' to indicate that no nutrient value could be computed.
    displayNutrients = '\t-\t-';
  } else {
    displayNutrients = '\t' + nutrientsToDisplay.map(nutrientId => nutrients[nutrientId].toFixed(0)).join('\t');
  }
  // Truncate to end of link and add nutrient info.  Appending text will extend the link
  // if the current text ends with a link, so we explicitly set the link url to null for
  // the appended text.
  textElement.replaceText('\\t.*$', '');
  var originalSize = textElement.getText().length;
  textElement.appendText(displayNutrients);
  // TODO: null works but might be invalid, maybe use empty string.
  textElement.setLinkUrl(originalSize, originalSize + displayNutrients.length - 1, <any>null);
}
