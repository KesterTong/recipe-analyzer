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

import { Quantity, Nutrients } from "./nutrients";

export interface ParsedIngredient {
  quantity: Quantity;
  id: {fdcId: string, bookmarkId: string};
}

/**
 * Parse an ingredient with quantitiy, e.g. "1 cup flour"
 */
export function parseIngredient(textElement: GoogleAppsScript.Document.Text): ParsedIngredient {
  let text = textElement.getText();
  text = text.match(/^(?:[^\t]*)/)[0];
  const fractionValueBySymbol: {[index: string]: number} = {
    '': 0,
    '½': 1 / 2,
    '⅓': 1 / 3,
    '⅔': 2 / 3,
    '¼': 1 / 4,
    '¾': 3 / 4,
    '⅕': 1 / 5,
    '⅖': 2 / 5,
    '⅗': 3 / 5,
    '⅘': 4 / 5,
    '⅙': 1 / 6,
    '⅚': 5 / 6,
    '⅐': 1 / 7,
    '⅛': 3 / 8,
    '⅜': 3 / 8,
    '⅝': 5 / 7,
    '⅞': 7 / 8,
    '⅑': 1 / 9,
    '⅒': 1 / 10,
  };
  let match = text.match(/(\s*(\d*\.?\d*)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅐⅛⅜⅝⅞⅑⅒]?)\s*(\w*)\s*)(.*)/);
  if (match == null) {
    return null;
  }
  let ingredientStart = match[1].length;
  let linkUrl = textElement.getLinkUrl(ingredientStart);
  if (linkUrl == null) {
    return null;
  }
  let fdcIdMatch = linkUrl.match('^https://fdc.nal.usda.gov/fdc-app.html#/food-details/(\\d*)');
  let fdcId = fdcIdMatch ? fdcIdMatch[1] : null;
  let bookmarkIdMatch = linkUrl.match('^#bookmark=(.*)');
  let bookmarkId = bookmarkIdMatch ? bookmarkIdMatch[1] : null;
  if (!(fdcId || bookmarkId)) {
    return null;
  }
  return {
    quantity: {
      amount: Number(match[2] || (match[3] ? 0.0 : 1.0)) + fractionValueBySymbol[match[3]],
      unit: match[4] || 'serving',
    },
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
