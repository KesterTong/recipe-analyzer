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
import { IngredientDatabase } from './core/IngredientDatabase';
import { loadCustomIngredients } from './loadCustomIngredients';
import { FoodDataCentralImpl } from './appsscript/FoodDataCentralImpl';
import { FirebaseImpl } from './appsscript/FirebaseImpl';

export function onOpen() {
  let ui = DocumentApp.getUi();
  ui.createMenu('Nutrient Data')
      .addItem('Recalculate', 'updateNutritionTables')
      .addItem('Show ingredients browser', 'showIngredientsSidebar')
      .addToUi();
}

export function showIngredientsSidebar() {
  let userInterface = HtmlService
  .createHtmlOutputFromFile('ui/ingredients')
  .setTitle('Ingredients');
  DocumentApp.getUi().showSidebar(userInterface);
}

function newIngredientDatabase(): IngredientDatabase {
  return new IngredientDatabase(FoodDataCentralImpl.build(), FirebaseImpl.build());
}

export function updateNutritionTables() {
  let ingredientDatabase = newIngredientDatabase();
  let documentAdaptor = new DocumentAdaptor(
    DocumentApp, DocumentApp.getActiveDocument());
  loadCustomIngredients(documentAdaptor, ingredientDatabase);
  let recipeAnalyzer = new RecipeAnalyzer(
    documentAdaptor,
    ingredientDatabase,
    PropertiesService);
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
