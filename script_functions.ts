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
import { normalizeFood } from './core/normalizeFood';
import { Food } from './core/Food';
import { NormalizedFood } from './core/NormalizedFood';
import { nutrientNames } from './core/Nutrients';

export function getSearchResultsImpl(query: string): FoodRef[] {
  return newIngredientDatabase().searchFoods(query);
};

export function showCustomIngredientSidebarImpl(bookmarkId: string) {
  let template = HtmlService.createTemplateFromFile('ui/custom_ingredient');
  template.bookmarkId = bookmarkId;
  let userInterface = template.evaluate().setTitle('Custom Ingredient');
  DocumentApp.getUi().showSidebar(userInterface);
}

function newIngredientDatabase(): IngredientDatabase {
  return new IngredientDatabase(FoodDataCentralImpl.build(), FirebaseImpl.build());
}

export function getFoodDetailsImpl(ingredientIdentifier: IngredientIdentifier): Food | null {
  return newIngredientDatabase().getFood(ingredientIdentifier);
}

export function patchFoodImpl(ingredientIdentifier: IngredientIdentifier, food: Food) {
  return newIngredientDatabase().patchFood(ingredientIdentifier, food);
}

export function getNormalizedFoodDetailsImpl(ingredientIdentifier: IngredientIdentifier): NormalizedFood | null {
  let food = newIngredientDatabase().getFood(ingredientIdentifier);
  if (food == null) {
    // TODO: handle this in the client
    return null;
  }
  let json = PropertiesService.getScriptProperties().getProperty('DISPLAY_NUTRIENTS');
  let nutrientsToDisplay: number[] = json == null ? [] : JSON.parse(json);
  return normalizeFood(food, nutrientsToDisplay);
}

export function moveCursorToBookmarkImpl(bookmarkId: string) {
  let document = DocumentApp.getActiveDocument()
  let bookmark = document.getBookmark(bookmarkId);
  if (bookmark == null) {
    return;
  }
  document.setCursor(bookmark.getPosition());
}

export function addIngredientImpl(ingredientIdentifier: IngredientIdentifier, amount: number, unit: string, description: string) {
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

export function getNutrientNamesImpl(): {id: number, name: string}[] {
  let namesById = nutrientNames();
  let json = PropertiesService.getScriptProperties().getProperty('DISPLAY_NUTRIENTS');
  let nutrientsToDisplay: number[] = json == null ? [] : JSON.parse(json);
  return nutrientsToDisplay.map(id => ({
    id: id,
    name: namesById[id],
  }));
}