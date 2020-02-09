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

import { nutrientsForQuantity } from './core/Quantity';
import { Nutrients, addNutrients } from './core/Nutrients';
import { IngredientDatabase } from './IngredientDatabase';
import { normalizeFood } from './core/normalizeFood';
import { DocumentAdaptor } from './appsscript/DocumentAdaptor';
import { parseQuantity } from './core/parseQuantity';

export class RecipeAnalyzer {
  private nutrientsToDisplay: number[];
  
  constructor(
      private documentAdaptor: DocumentAdaptor,
      private fdcClient: IngredientDatabase,
      propertiesService: GoogleAppsScript.Properties.PropertiesService,
      private documentApp: GoogleAppsScript.Document.DocumentApp) {
    let json = propertiesService.getScriptProperties().getProperty('DISPLAY_NUTRIENTS')
    // TODO: nutrientsToDisplay == [] should be an error.
    this.nutrientsToDisplay = json == null ? [] : JSON.parse(json);
  }

  private parseIngredient(textElement: GoogleAppsScript.Document.Text): Nutrients | null {
    let ingredientUrl = null;
    let ingredientStart = 0;
    let text = textElement.getText();
    let textLength = text.length;
    while(ingredientStart < textLength && (ingredientUrl = textElement.getLinkUrl(ingredientStart)) == null) {
      ingredientStart++;
    }
    if (ingredientUrl == null) {
      return null;
    }
    let quantity = parseQuantity(text.substr(0, ingredientStart));
    if (quantity == null) {
      return null;
    }
    let foodDetails = this.fdcClient.getFoodDetails(ingredientUrl);
    if (foodDetails == null) {
      return null;
    }
    let foodData = normalizeFood(foodDetails, this.nutrientsToDisplay);
    if (foodData == null) {
      return null;
    }
    return nutrientsForQuantity(quantity, foodData);
  }

  private updateIngredient(textElement: GoogleAppsScript.Document.Text, nutrients: Nutrients | null, nutrientsToDisplay: number[]) {
    let displayNutrients: string;
    if (nutrients == null) {
      // Display '-' to indicate that no nutrient value could be computed.
      displayNutrients = '\t-\t-';
    } else {
      displayNutrients = '\t' + nutrientsToDisplay.map(nutrientId => nutrients[nutrientId].toFixed(0)).join('\t');
    }
    // Truncate to end of link and add nutrient info.  Appending text will extend the link
    // if the current text ends with a link, so we explicitly set the link url to null for
    // the appended text.
    textElement.replaceText('\\t.*$', '');
    var originalSize = textElement.getText().length;
    textElement.appendText(displayNutrients);
    // TODO: null works but might be invalid, maybe use empty string.
    textElement.setLinkUrl(originalSize, originalSize + displayNutrients.length - 1, <any>null);
  }

  updateElement(element: GoogleAppsScript.Document.Text): Nutrients {
    let nutrients = this.parseIngredient(element);
    this.updateIngredient(element, nutrients, this.nutrientsToDisplay);
    return nutrients || {};
  }

  updateDocument() {
    this.documentAdaptor.recipes().forEach(recipeAdaptor => {
      let nutrientsPerServing: Nutrients = {}
      recipeAdaptor.ingredients.forEach(textElement => {
        let nutrients = this.updateElement(textElement);
        nutrientsPerServing = addNutrients(nutrientsPerServing, nutrients);
      });
      this.updateTotalElement(recipeAdaptor.totalElement, nutrientsPerServing);
      if (recipeAdaptor.bookmarkId != null) {
        this.fdcClient.addCustomFood(recipeAdaptor.bookmarkId, {
          dataType: 'Recipe',
          ingredients: '',
          brandOwner: '',
          description: recipeAdaptor.description || '',
          ingredientsList: [],
          nutrientsPerServing: nutrientsPerServing,
          servingEquivalentQuantities: {'serving': 1},
        });
      }
    })
  }

  updateTotalElement(totalElement: GoogleAppsScript.Document.ListItem, runningTotal: Nutrients) {
    totalElement.setText('Total\t' + this.nutrientsToDisplay.map(nutrientId => runningTotal[nutrientId].toFixed(0)).join('\t'));
  }
}
