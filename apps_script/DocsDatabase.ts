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

import { Database } from "../src/document/Database";
import { debounce } from "throttle-debounce";

/**
 * An implementation of a Database that stores recipes in a Google Doc.
 */
export const DocsDatabase: Database = {
  parseDocument: () => {
    return new Promise((resolve, reject) => {
      (<any>window).google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .parseDocument();
    });
  },

  addIngredient: (rangeId) => {
    return new Promise((resolve, reject) => {
      (<any>window).google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .addIngredient(rangeId);
    });
  },

  // TODO: this isn't quite right, we should batch updates otherwise we will
  // lose updates when we edit multiple ingredients/recipes within the debounce
  // period.
  updateIngredient: debounce(5000, (rangeId, ingredientIndex, ingredient) => {
    return new Promise((resolve, reject) => {
      (<any>window).google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .updateIngredient(rangeId, ingredientIndex, ingredient);
    });
  }),
};
