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

import { Quantity } from "./nutrients";

/**
 * Parse the textual representation of a food's serving size and equivalent units.
 */
export function parseServingSize(servingSizeText: string): Quantity[] {
  let result: Quantity[] = [];
  let lines = servingSizeText.split('\n');
  let servingSizeLine = lines[0];
  let otherPortionsLines = lines.slice(1);
  let match = servingSizeLine.match(/^\s*(\d*\.?\d*)\s*([^\(]*)(?:\(\s*(\d*\.?\d*)\s*(.*)\)|)$/);
  if (match != null) {
    result.push({
      amount: Number(match[1]),
      unit: match[2].trim(),
    });
    if (match[3] != null) {
      result.push({
        amount: Number(match[3]),
        unit: match[4].trim(),
      });
    }
  }
  // NOTE: this assumes serving size is 100g.
  for (let i = 0; i < otherPortionsLines.length; i++) {
    let match = otherPortionsLines[i].match(/^\s*(\d*\.?\d*)\s*(\w*)\s*=\s*(\d*\.?\d*)\s*(\w*)\s*/);
    result.push({
      amount: 100 / Number(match[1]) / Number(match[3]),
      unit: match[2],
    });
  }
  return result;
}
