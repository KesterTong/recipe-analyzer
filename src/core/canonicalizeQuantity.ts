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
import { Unit } from "./Unit";

// Data derived from the config, but optimized for conversion.
// Fields should not be used outside of initializeQuantityData
// and canonicalizeQuantity.
export interface ConversionData {
  gramEquivalentByUnit: { [index: string]: number };
  mlEquivalentByUnit: { [index: string]: number };
}

export function initializeQuantityData(
  massUnits: Unit[],
  volumeUnits: Unit[]
): ConversionData {
  const gramEquivalentByUnit: { [index: string]: number } = {};
  const mlEquivalentByUnit: { [index: string]: number } = {};
  massUnits.forEach((unit) => {
    gramEquivalentByUnit[unit.name] = unit.value;
    unit.otherNames.forEach((name) => {
      gramEquivalentByUnit[name] = unit.value;
    });
  });
  volumeUnits.forEach((unit) => {
    mlEquivalentByUnit[unit.name] = unit.value;
    unit.otherNames.forEach((name) => {
      mlEquivalentByUnit[name] = unit.value;
    });
  });
  return { gramEquivalentByUnit, mlEquivalentByUnit };
}

/**
 * Transform a quantity by
 *  - Converting mass units to 'g' and volume units to 'ml'.
 *  - Removing trailing 's' to alllow plural and singular forms.
 *  - Convert to lowercase.
 */
export function canonicalizeQuantity(
  quantity: Quantity,
  conversionData: ConversionData
): Quantity {
  const { gramEquivalentByUnit, mlEquivalentByUnit } = conversionData;
  let { amount, unit } = quantity;
  unit = unit.toLowerCase().replace(/(\w*)s$/, "$1");
  if (gramEquivalentByUnit[unit]) {
    return { amount: amount * gramEquivalentByUnit[unit], unit: "g" };
  }
  if (mlEquivalentByUnit[unit]) {
    return { amount: amount * mlEquivalentByUnit[unit], unit: "ml" };
  }
  return { amount, unit };
}
