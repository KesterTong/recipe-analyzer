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
 * Functions made available to the client.  See client/script_functions.ts.
 */
import { IngredientDatabase } from './core/IngredientDatabase';
import { FoodRef, IngredientIdentifier } from './core/FoodRef';
import { FirebaseImpl } from './appsscript/FirebaseImpl';
import { FoodDataCentralImpl } from './appsscript/FoodDataCentralImpl';
import { Food } from './core/Food';
import { NutrientInfo } from './core/Nutrients';

export interface GetNutrientInfoCall {
  name: 'GetNutrientInfo',
  callback: (arg: NutrientInfo[]) => void,
}

export interface GetFoodCall {
  name: 'GetFood',
  ingredientIdentifier: IngredientIdentifier,
  callback: (arg: Food | null) => void,
}

export interface PatchFoodCall {
  name: 'PatchFood',
  ingredientIdentifier: IngredientIdentifier,
  food: Food,
  callback: (arg: void) => void,
}

export interface SearchFoodsCall {
  name: 'SearchFoods',
  query: string,
  callback: (arg: FoodRef[]) => void,
}

export interface AddIngredientCall {
  name: 'AddIngredient',
  ingredientIdentifier: IngredientIdentifier,
  amount: number,
  unit: string,
  description: string,
  callback: (arg: void) => void,
}

export type ScriptFunctionCall = (
  GetNutrientInfoCall |
  GetFoodCall |
  PatchFoodCall |
  SearchFoodsCall |
  AddIngredientCall);

function newIngredientDatabase(): IngredientDatabase {
  return new IngredientDatabase(FoodDataCentralImpl.build(), FirebaseImpl.build());
}

function addIngredient(
  ingredientIdentifier: IngredientIdentifier,
  amount: number, unit: string, description: string) {
  let unitString = amount.toString() + ' ' + unit + ' ';
  let fullText = unitString + description
  let document = DocumentApp.getActiveDocument();
  let cursor = document.getCursor();
  let text = cursor.insertText(fullText);
  let linkUrl: string;
  switch (ingredientIdentifier.identifierType) {
    case 'BookmarkId':
      linkUrl = '#bookmark=' + ingredientIdentifier.bookmarkId;
      break;
    case 'FdcId':
      linkUrl = 'https://fdc.nal.usda.gov/fdc-app.html#/food-details/' + ingredientIdentifier.fdcId.toString() + '/nutrients';
      break;
  }
  text.setLinkUrl(unitString.length, fullText.length - 1, linkUrl);
  document.setCursor(document.newPosition(text, fullText.length));
}

export function dispatch(scriptFunctionCall: ScriptFunctionCall): any {
  let result: any;
  scriptFunctionCall.callback = (x: any) => {result = x;}
  switch (scriptFunctionCall.name) {
    case 'GetNutrientInfo':
      scriptFunctionCall.callback(newIngredientDatabase().getNutrientInfo());
      break;
    case 'GetFood':
      scriptFunctionCall.callback(newIngredientDatabase().getFood(
        scriptFunctionCall.ingredientIdentifier));
      break;
    case 'PatchFood':
      scriptFunctionCall.callback(newIngredientDatabase().patchFood(
        scriptFunctionCall.ingredientIdentifier,
        scriptFunctionCall.food));
      break;
    case 'SearchFoods':
      scriptFunctionCall.callback(newIngredientDatabase().searchFoods(
        scriptFunctionCall.query));
      break;
    case 'AddIngredient':
      scriptFunctionCall.callback(addIngredient(
        scriptFunctionCall.ingredientIdentifier,
        scriptFunctionCall.amount,
        scriptFunctionCall.unit,
        scriptFunctionCall.description));
      break;
  }
  return result;
}
