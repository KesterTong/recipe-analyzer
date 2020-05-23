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

/**
 * Transform a quantity by
 *  - Converting mass units to 'g' and volume units to 'ml'.
 *  - Convert to lowercase.
 */
export function canonicalizeQuantity(
  quantity: Quantity,
  config: {
    massUnits: { [index: string]: number };
    volumeUnits: { [index: string]: number };
  }
): Quantity {
  const { massUnits, volumeUnits } = config;
  let { amount, unit } = quantity;
  unit = unit.toLowerCase();
  if (massUnits[unit]) {
    return { amount: amount * massUnits[unit], unit: "g" };
  }
  if (volumeUnits[unit]) {
    return { amount: amount * volumeUnits[unit], unit: "ml" };
  }
  return { amount, unit };
}
