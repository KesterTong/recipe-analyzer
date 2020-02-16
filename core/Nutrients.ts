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

// NOTE the typescript -> appscript conversion doesn't work with
// exporting of constants so we expose this via `nameForNutrient`.
const NUTRIENT_NAME_BY_ID: {[index: number]: string} = {
  1003: 'Protein (g)',
  1004: 'Fat (g)',
  1005: 'Carbohydrate (g)',
  1008: 'Energy (kcal)',
};

export function nameForNutrient(id: number): string | null {
  return NUTRIENT_NAME_BY_ID[id] || null;
};

export function idForNutrient(name: string): number | null {
  for (let idAsStr in NUTRIENT_NAME_BY_ID) {
    let id: number = Number(idAsStr);
    let currentName = NUTRIENT_NAME_BY_ID[id];
    if (currentName == name) {
      return id;
    }
  }
  return null;
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