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
  [index: string]: number;
}

export function scaleNutrients(nutrients: Nutrients, scale: number): Nutrients {
  var result: Nutrients = {};
  for (var nutrientKey in nutrients) {
    result[nutrientKey] = nutrients[nutrientKey] * scale;
  }
  return result;
}

export function addNutrients(lhs: Nutrients, rhs: Nutrients): Nutrients {
  var result: Nutrients = {};
  for (var nutrientKey in lhs) {
    result[nutrientKey] = lhs[nutrientKey];
  }
  for (var nutrientKey in rhs) {
    result[nutrientKey] = (result[nutrientKey] || 0) + rhs[nutrientKey];
  }
  return result;
}