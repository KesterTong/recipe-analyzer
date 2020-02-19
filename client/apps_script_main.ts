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
 * Functions that can be called from the HTML UI (client).
 * 
 * These functions provide access to the Google Doc and also Firebase and 
 * Web functions that are accesssed via the Apps Script server code.
 * 
 * For convenience we expose these as promises.
 */
import {
  GetNutrientInfo,
  GetFood,
  PatchFood,
  SearchFoods,
  AddIngredient,
  ScriptFunction,
} from "../script_functions";
import { main } from "./ingredients";
import { setClientIngredientDatabase } from "./ClientIngredientDatabase";

function wrapServerFunction<T, U>(serverFunction: ScriptFunction<T, U>): (arg: T) => Promise<U> {
  console.log(serverFunction.name);
  return (arg: T) => new Promise<U>((resolve, reject) => {
    (<any>window).google.script.run
    .withSuccessHandler((x: U) => { console.log(x); resolve(x); })
    .withFailureHandler(reject)
    .dispatch(serverFunction.name(), arg);
  });
}

setClientIngredientDatabase({
  getNutrientInfo: wrapServerFunction(new GetNutrientInfo()),
  getFood: wrapServerFunction(new GetFood()),
  patchFood: wrapServerFunction(new PatchFood),
  searchFoods: wrapServerFunction(new SearchFoods()),
  addIngredient: wrapServerFunction(new AddIngredient()),
});
/**
 * Main entrypoint for AppsScript UI.
 */
$(main);