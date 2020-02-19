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
  ScriptFunctionBase,
} from "../script_functions";
import { main } from "./ingredients";
import { setClientIngredientDatabase, ClientIngredientDatabase } from "./ClientIngredientDatabase";
import { IngredientIdentifier, FoodRef } from "../core/FoodRef";
import { Food } from "../core/Food";
import { NutrientInfo } from "../core/Nutrients";


function runServerFunction<T, U, F extends ScriptFunction<T, U>>(serverFunction: F, args: T): Promise<U> {
  return runServerFunctionImpl(serverFunction, args);
}

function runServerFunctionImpl(serverFunction: ScriptFunctionBase, args: any): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    (<any>window).google.script.run
    .withSuccessHandler(resolve)
    .withFailureHandler(reject)
    .dispatch(serverFunction.name(), args);
  });
}

class ClientIngredientDatabaseImpl implements ClientIngredientDatabase {
  getNutrientInfo(): Promise<NutrientInfo[]> {
    return runServerFunction(new GetNutrientInfo(), []);
  }
  getFood(ingredientIdentifier: IngredientIdentifier): Promise<Food | null> {
    return runServerFunction(new GetFood(), [ingredientIdentifier]);
  }
  patchFood(ingredientIdentifier: IngredientIdentifier, food: Food): Promise<void> {
    return runServerFunction(new PatchFood(), [ingredientIdentifier, food]);
  }
  searchFoods(query: string): Promise<FoodRef[]> {
    return runServerFunction(new SearchFoods(), [query]);
  }
  addIngredient(ingredientIdentifier: IngredientIdentifier, amount: number, unit: string, description: string): Promise<void> {
    return runServerFunction(new AddIngredient(), [ingredientIdentifier, amount, unit, description]);
  }
}

setClientIngredientDatabase(new ClientIngredientDatabaseImpl());
/**
 * Main entrypoint for AppsScript UI.
 */
$(main);