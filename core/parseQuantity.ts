import { Quantity } from "./Quantity";

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
 * Parse a quantity, e.g. "1 cup"
 */
export function parseQuantity(text: string): Quantity {
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
  return {
    amount: Number(match[2] || (match[3] ? 0.0 : 1.0)) + fractionValueBySymbol[match[3]],
    unit: match[4] || 'serving',
  };
}
