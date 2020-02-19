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

class ClientIngredientDatabaseImpl implements ClientIngredientDatabase {
  getNutrientInfo(arg: null): Promise<import("../core/Nutrients").NutrientInfo[]> {
    return this.runServerFunction(new GetNutrientInfo(), arg);
  }
  getFood(arg: IngredientIdentifier): Promise<Food | null> {
    return this.runServerFunction(new GetFood(), arg);
  }
  patchFood(arg: { ingredientIdentifier: IngredientIdentifier; food: Food; }): Promise<void> {
    return this.runServerFunction(new PatchFood(), arg);
  }
  searchFoods(arg: string): Promise<FoodRef[]> {
    return this.runServerFunction(new SearchFoods(), arg);
  }
  addIngredient(arg: { ingredientIdentifier: IngredientIdentifier; amount: number; unit: string; description: string; }): Promise<void> {
    return this.runServerFunction(new AddIngredient(), arg);
  }

  private runServerFunction<T, U>(serverFunction: ScriptFunction<T, U>, arg: T): Promise<U> {
    return this.runServerFunctionImpl(serverFunction, arg);
  }

  private runServerFunctionImpl(serverFunction: ScriptFunctionBase, arg: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      (<any>window).google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      .dispatch(serverFunction.name(), arg);
    });
  }
}

setClientIngredientDatabase(new ClientIngredientDatabaseImpl());
/**
 * Main entrypoint for AppsScript UI.
 */
$(main);