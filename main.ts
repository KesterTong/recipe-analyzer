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
import { DocumentAdaptor } from './appsscript/DocumentAdaptor';
import { IngredientDatabase } from './IngredientDatabase';
import { loadCustomIngredients } from './loadCustomIngredients';
import { FoodLink } from './core/FoodLink';
import { nutrientNames } from './core/Nutrients';
import { normalizeFood } from './core/normalizeFood';
import { NormalizedFood } from './core/NormalizedFood';

export function onOpen() {
  let ui = DocumentApp.getUi();
  ui.createMenu('Nutrient Data')
      .addItem('Recalculate', 'updateNutritionTables')
      .addItem('Show ingredients browser', 'showIngredientsSidebar')
      .addToUi();
}

export function moveCursorToBookmark(url: string) {
  let prefix = '#bookmark='
  if (!url.startsWith(prefix)) {
    return;
  }
  let bookmarkId = url.substr(prefix.length, url.length - prefix.length);
  let document = DocumentApp.getActiveDocument()
  let bookmark = document.getBookmark(bookmarkId);
  if (bookmark == null) {
    return;
  }
  document.setCursor(bookmark.getPosition());
}

export function addIngredient(linkUrl: string, amount: number, unit: string, description: string) {
  let unitString = amount.toString() + ' ' + unit + ' ';
  let fullText = unitString + description
  let document = DocumentApp.getActiveDocument();
  let cursor = document.getCursor();
  let text = cursor.insertText(fullText);
  text.setLinkUrl(unitString.length, fullText.length - 1, linkUrl);
  document.setCursor(document.newPosition(text, fullText.length));
}

export function showIngredientsSidebar() {
  let userInterface = HtmlService
  .createHtmlOutputFromFile('ui/ingredients')
  .setTitle('Ingredients');
  DocumentApp.getUi().showSidebar(userInterface);
}

export function getSearchResults(query: string, includeBranded: boolean): FoodLink[] {
  let ingredientDatabase = IngredientDatabase.build();
  return  ingredientDatabase.searchFoods(query, includeBranded);
}

export function getFoodDetails(url: string): NormalizedFood | null {
  let ingredientDatabase = IngredientDatabase.build();
  let details = ingredientDatabase.getFoodDetails(url);
  if (details == null) {
    // TODO: handle this in the client
    return null;
  }
  let json = PropertiesService.getScriptProperties().getProperty('DISPLAY_NUTRIENTS');
  let nutrientsToDisplay: number[] = json == null ? [] : JSON.parse(json);
  return normalizeFood(details, nutrientsToDisplay);
}

export function getNutrientNames(): {id: number, name: string}[] {
  let namesById = nutrientNames();
  let json = PropertiesService.getScriptProperties().getProperty('DISPLAY_NUTRIENTS');
  let nutrientsToDisplay: number[] = json == null ? [] : JSON.parse(json);
  return nutrientsToDisplay.map(id => ({
    id: id,
    name: namesById[id],
  }));
}

export function updateNutritionTables() {
  let document = DocumentApp.getActiveDocument();
  let ingredientDatabase = IngredientDatabase.build();
  let documentAdaptor = new DocumentAdaptor(DocumentApp, document);
  loadCustomIngredients(documentAdaptor, ingredientDatabase);
  let recipeAnalyzer = new RecipeAnalyzer(
    documentAdaptor,
    ingredientDatabase,
    PropertiesService,
    DocumentApp);
  recipeAnalyzer.updateDocument();
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
  if (cache != null && cache.get('documentHash') ==  documentHash) {
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
  if (cache != null) {
    cache.put('documentHash', documentHash, 3600);
  }
}
