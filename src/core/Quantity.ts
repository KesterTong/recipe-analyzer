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

import { NormalizedFood } from "./NormalizedFood";
import { Nutrients, scaleNutrients } from "./Nutrients";

export interface Quantity {
  amount: number;
  unit: string;
}

/**
 * Transform a quantity by
 *  - Converting mass units to 'g' and volume units to 'ml'.
 *  - Removing trailing 's' to alllow plural and singular forms.
 *  - Convert to lowercase.
 */
export function canonicalizeQuantity(quantity: Quantity): Quantity {
  var amount = quantity.amount;
  var unit = quantity.unit.toLowerCase().replace(/(\w*)s$/, "$1");
  const gramEquivalentByUnit: { [index: string]: number } = {
    oz: 28.35,
    lb: 453.59,
    kg: 1000.0,
  };
  const mlEquivalentByUnit: { [index: string]: number } = {
    "fl oz": 29.5735,
    "fl. oz": 29.5735,
    cup: 236.59,
    tbsp: 14.79,
    tablespoon: 14.79,
    tsp: 4.93,
    teaspoon: 4.93,
    pint: 473.17,
    quart: 946.35,
    gallon: 3785.41,
  };

  if (gramEquivalentByUnit[unit]) {
    return {
      amount: amount * gramEquivalentByUnit[unit],
      unit: "g",
    };
  }
  if (mlEquivalentByUnit[unit]) {
    return {
      amount: amount * mlEquivalentByUnit[unit],
      unit: "ml",
    };
  }
  return { amount: amount, unit: unit };
}
