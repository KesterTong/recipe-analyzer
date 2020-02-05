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

/** Tools for computations with nutritional data */
export interface Nutrients {
  [index: number]: number;
}

// NOTE: using functions here as constants don't seem to work with
// TypeScript -> Apps Script conversion.
export function nutrientNames(): {[index: number]: string} {
  return {
    1003: 'protein (g)',
    1004: 'fat (g)',
    1005: 'carbohydrate (g)',
    1008: 'energy (kcal)',
  };
};

export function scaleNutrients(nutrients: Nutrients, scale: number): Nutrients {
  let result: Nutrients = {};
  for (let nutrientKey in nutrients) {
    result[nutrientKey] = nutrients[nutrientKey] * scale;
  }
  return result;
}

export function addNutrients(lhs: Nutrients, rhs: Nutrients): Nutrients {
  let result: Nutrients = {};
  for (let nutrientKey in lhs) {
    result[nutrientKey] = lhs[nutrientKey];
  }
  for (let nutrientKey in rhs) {
    result[nutrientKey] = (result[nutrientKey] || 0) + rhs[nutrientKey];
  }
  return result;
}