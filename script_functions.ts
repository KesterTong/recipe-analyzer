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

export interface ScriptFunctionBase { 
  name(): string,
  impl(args: any): any,
}

export interface ScriptFunction<T, U> extends ScriptFunctionBase { 
  name(): string,
  impl(args: T): U,
};

function newIngredientDatabase(): IngredientDatabase {
  return new IngredientDatabase(FoodDataCentralImpl.build(), FirebaseImpl.build());
}

export class GetNutrientInfo implements ScriptFunction<[], NutrientInfo[]> {
  name() { return 'GetNutrientInfo'; }
  impl(args: []) { return newIngredientDatabase().getNutrientInfo(); }
}

export class GetFood implements ScriptFunction<[IngredientIdentifier], Food | null> {
  name() { return 'GetFood'; }
  impl(args: [IngredientIdentifier]): Food | null {
    return newIngredientDatabase().getFood(args[0]);
  }
}

export class PatchFood implements ScriptFunction<[IngredientIdentifier, Food], void> {
  name() { return 'PatchFood'; }
  impl(args: [IngredientIdentifier, Food]) {
    return newIngredientDatabase().patchFood(args[0], args[1]);
  }
}

export class SearchFoods implements ScriptFunction<[string], FoodRef[]> {
  name() { return 'SearchFoods'; }
  impl(args: [string]) { return newIngredientDatabase().searchFoods(args[0]); }
}

export class AddIngredient implements ScriptFunction<[IngredientIdentifier, number, string, string], void> {
  name() { return 'AddIngredient'; }
  impl(args: [IngredientIdentifier, number, string, string]) {
    return this.addIngredient(args[0], args[1], args[2], args[3]);
  }
  private addIngredient(
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
}

export function dispatch(name: string, arg: any): any {
  let scriptFunctions: ScriptFunctionBase[] = [
    new GetNutrientInfo(),
    new GetFood(),
    new PatchFood(),
    new SearchFoods(),
    new AddIngredient(),
  ];
  for (let i = 0; i < scriptFunctions.length; i++) {
    if (name == scriptFunctions[i].name()) {
      return scriptFunctions[i].impl(arg);
    }
  }
}
