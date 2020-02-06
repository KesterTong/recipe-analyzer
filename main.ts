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

import { RecipeAnalyzer } from './RecipeAnalyzer';
import { BookmarkManager } from './BookmarkManager';
import { FDCClient, SearchResult } from './FDCClient';
import { loadCustomIngredients } from './loadCustomIngredients';
import { printHouseholdServing } from './core/printHouseholdServing';
import { FoodDetails } from './core/FoodDetails';

export function onOpen() {
  let ui = DocumentApp.getUi();
  ui.createMenu('Nutrient Data')
      .addItem('Recalculate', 'updateNutritionTables')
      .addItem('Ingredients', 'showIngredientsSidebar')
      .addToUi();
}

export function getCustomFoods(): FoodDetails[] {
  let document = DocumentApp.getActiveDocument();
  let fdcClient = new FDCClient(UrlFetchApp, CacheService, PropertiesService);
  let bookmarkManager = new BookmarkManager(document);
  loadCustomIngredients(document, bookmarkManager, fdcClient);
  return fdcClient.getCustomFoods();
}

export function addIngredient(fdcId: Number, description: string) {
  let unitString = '100 g ';
  let fullText = unitString + description
  let document = DocumentApp.getActiveDocument();
  let cursor = document.getCursor();
  let text = cursor.insertText(fullText);
  text.setLinkUrl(
    unitString.length,
    fullText.length - 1,
    'https://fdc.nal.usda.gov/fdc-app.html#/food-details/' + fdcId + '/nutrients');
  document.setCursor(document.newPosition(text, fullText.length));
}

export function showIngredientsSidebar() {
  let ui = DocumentApp.getUi();
  let userInterface = HtmlService
  .createHtmlOutputFromFile('ui/ingredients')
  .setTitle('Custom Ingredients');
  DocumentApp.getUi().showSidebar(userInterface);
}

export function getSearchResults(query: string, includeBranded: boolean): SearchResult[] {
  let fdcClient = new FDCClient(UrlFetchApp, CacheService, PropertiesService);
  return  fdcClient.searchFoods(query, includeBranded);
}

export function getFoodDetails(fdcId: number): any {
  let fdcClient = new FDCClient(UrlFetchApp, CacheService, PropertiesService);
  let details = fdcClient.getFoodDetails({fdcId: fdcId});
  let result = <any>details;
  result.householdServing = printHouseholdServing(details);
  return result;
}

export function updateNutritionTables() {
  let document = DocumentApp.getActiveDocument();
  let fdcClient = new FDCClient(UrlFetchApp, CacheService, PropertiesService);
  let bookmarkManager = new BookmarkManager(document);
  loadCustomIngredients(document, bookmarkManager, fdcClient);
  let recipeAnalyzer = new RecipeAnalyzer(
    bookmarkManager,
    fdcClient,
    PropertiesService,
    DocumentApp);
  recipeAnalyzer.updateDocument(document);
}

// An ingredient table looks like:
//
// Ingredients
//   * first ingredient ...
//   * second ingredient ...
//
// In terms of the doc structure, it is a sequence of
//   - a paragraph whose text is "Ingredients"
//   - any number of list elements each containing a single Text element
//   - any other element
export function updateNutritionTablesIfDocumentHasChanged() {
  var body = DocumentApp.getActiveDocument().getBody();
  var documentHash = Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, body.getText()));
  var cache = CacheService.getUserCache();
  if (cache.get('documentHash') ==  documentHash) {
    // Note we don't extend the TTL as we want to keep the hash entries for the USDA
    // database lookups alive, and to do this we need to scan the document again.  This
    // also requires that we use a shorter TLL on the document hash than the USDA data
    // lookups.  We use 1 hour for the document hash and 6 hours for the USDA data lookups.
    Logger.log('Document has not changed, skipping run.');
    return;
  }

  updateNutritionTables();

  // Note: this prevents rerunning even if there were failures in the
  // call to the API.
  documentHash = Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, body.getText()));
  // Store in cache with TTL of 1 hour.
  cache.put('documentHash', documentHash, 3600);
}
