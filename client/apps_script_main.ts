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
  GetNutrientInfoCall,
  GetFoodCall,
  PatchFoodCall,
  SearchFoodsCall,
  AddIngredientCall,
  ScriptFunctionCall
} from "../script_functions";
import { main } from "./ingredients";
import { setClientIngredientDatabase, ClientIngredientDatabase } from "./ClientIngredientDatabase";
import { IngredientIdentifier, FoodRef } from "../core/FoodRef";
import { Food } from "../core/Food";
import { NutrientInfo } from "../core/Nutrients";

function runServerFunction(scriptFunctionCall: ScriptFunctionCall) {
  return runServerFunctionImpl(scriptFunctionCall);
}

function runServerFunctionImpl(scriptFunctionCall: any) {
  let callback = scriptFunctionCall.callback;
  scriptFunctionCall.callback = null;
  (<any>window).google.script.run.withSuccessHandler(callback).dispatch(scriptFunctionCall);
}

class ClientIngredientDatabaseImpl implements ClientIngredientDatabase {
  getNutrientInfo(): Promise<NutrientInfo[]> {
    return new Promise(resolve => runServerFunction({
      name: 'GetNutrientInfo',
      callback: resolve,
    }));
  }

  getFood(ingredientIdentifier: IngredientIdentifier): Promise<Food | null> {
    return new Promise(resolve => runServerFunction({
      name: 'GetFood',
      ingredientIdentifier: ingredientIdentifier,
      callback: resolve,
    }));
  }

  patchFood(ingredientIdentifier: IngredientIdentifier, food: Food): Promise<void> {
    return new Promise(resolve => runServerFunction({
      name: 'PatchFood',
      ingredientIdentifier: ingredientIdentifier,
      food: food,
      callback: resolve,
    }));
  }

  searchFoods(query: string): Promise<FoodRef[]> {
    return new Promise(resolve => runServerFunction({
      name: 'SearchFoods',
      query: query,
      callback: resolve,
    }));
  }

  addIngredient(
    ingredientIdentifier: IngredientIdentifier, amount: number, unit: string, description: string): Promise<void> {
    return new Promise(resolve => runServerFunction({
      name: 'AddIngredient',
      ingredientIdentifier: ingredientIdentifier,
      amount: amount,
      unit: unit,
      description: description,
      callback: resolve,
    }));  
  }
}

setClientIngredientDatabase(new ClientIngredientDatabaseImpl());
/**
 * Main entrypoint for AppsScript UI.
 */
$(main);