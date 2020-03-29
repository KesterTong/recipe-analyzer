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

import { Quantity } from "./Quantity";
import { HouseholdServing } from "./FoodDataCentral";
import { parseQuantity } from "./parseQuantity";

/**
 * Parse the serving size unit from a USDA label.
 *
 * E.g. "30 ml" or "1 cup (230 g)" or "1 scoop (36 ml)".
 *
 * Note that "1 cup" is not allowed since the gram or ml
 * equivalent must be specified.
 */
export function parseHouseholdServing(text: string): HouseholdServing | null {
  let metricUnits: Quantity | null;
  let customaryUnitsText: string | undefined;
  let match = text.match(/^([^\(]*)\(([^\)]*)\)$/);
  if (match == null) {
    metricUnits = parseQuantity(text);
    customaryUnitsText = undefined;
  } else {
    metricUnits = parseQuantity(match[2]);
    customaryUnitsText = match[1].trim();
  }
  if (
    metricUnits == null ||
    (metricUnits.unit != "g" && metricUnits.unit != "ml")
  ) {
    return null;
  }
  return {
    servingSize: metricUnits.amount,
    servingSizeUnit: metricUnits.unit,
    householdServingFullText: customaryUnitsText,
  };
}
