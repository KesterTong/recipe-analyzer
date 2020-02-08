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
import { foodDetailsToFoodData } from './core/foodDetailsToFoodData';
import { BookmarkManager } from './BookmarkManager';
import { parseQuantity } from './core/parseQuantity';

export class RecipeAnalyzer {
  private nutrientsToDisplay: number[];
  
  constructor(
      private bookmarkManager: BookmarkManager,
      private fdcClient: IngredientDatabase,
      propertiesService: GoogleAppsScript.Properties.PropertiesService,
      private documentApp: GoogleAppsScript.Document.DocumentApp) {
    let json = propertiesService.getScriptProperties().getProperty('DISPLAY_NUTRIENTS')
    // TODO: nutrientsToDisplay == [] should be an error.
    this.nutrientsToDisplay = json == null ? [] : JSON.parse(json);
  }

  private computeNutrients(textElement: GoogleAppsScript.Document.Text): Nutrients | null {
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
    let foodData = foodDetailsToFoodData(foodDetails, this.nutrientsToDisplay);
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

  updateElement(element: GoogleAppsScript.Document.ListItem): Nutrients {
    // If numChildren != 1, skip this element as it's too complicated
    if (element.getNumChildren() != 1) {
      return {};
    }
    let childElement = element.getChild(0);
    if (childElement.getType() != this.documentApp.ElementType.TEXT) {
      return {};
    }
    let textElement = <GoogleAppsScript.Document.Text>childElement;
    let nutrients: Nutrients | null = this.computeNutrients(textElement);
    this.updateIngredient(textElement, nutrients, this.nutrientsToDisplay);
    return nutrients || {};
  }

  updateDocument(document: GoogleAppsScript.Document.Document) {
    enum State {
      LOOKING_FOR_RECIPE,
      LOOKING_FOR_TITLE,
      INSIDE_RECIPE,
    }
    let state: State = State.LOOKING_FOR_RECIPE;
    let totalElement: GoogleAppsScript.Document.ListItem | null = null;
    let runningTotal: Nutrients | null = null;
    let body = document.getBody();
    for (let i = body.getNumChildren() - 1; i > 0; i--) {
      let element = body.getChild(i);
      // First we do a state transition to LOOKING_FOR_TITLE in the case
      // that the current element is not a list item.  This is so we can then
      // check if the current element is the title.
      if (state == State.INSIDE_RECIPE && element.getType() != this.documentApp.ElementType.LIST_ITEM) {
        this.updateTotalElement(totalElement!, runningTotal!);
        totalElement = null;
        state = State.LOOKING_FOR_TITLE;
      }
  
      let maybeBookmarkId: string | null;
      if (state == State.LOOKING_FOR_TITLE && (maybeBookmarkId = this.bookmarkManager.bookmarkIdForElement(element))) {
        this.fdcClient.addCustomFood(
          maybeBookmarkId,
          {
            dataType: 'Branded',
            description: element.asParagraph().getText(),
            foodNutrients: this.nutrientsToDisplay.map(nutrientId => ({
              nutrient: {id: nutrientId},
              amount: runningTotal![nutrientId],
            })),
            // Fake values that make the nutrient values correct.
            servingSize: 100,
            servingSizeUnit: 'g',
            householdServingFullText: '1 serving',
          });
        runningTotal = null;
        state = State.LOOKING_FOR_RECIPE;
      } else if ((state == State.LOOKING_FOR_RECIPE || State.LOOKING_FOR_TITLE) && this.isTotalElement(element)) {
        totalElement = element.asListItem();
        runningTotal = {};
        state = State.INSIDE_RECIPE;
      } else if (state == State.INSIDE_RECIPE) {
        var nutrients = this.updateElement(element.asListItem());
        runningTotal = addNutrients(runningTotal!, nutrients);
      }
    }
  }

  isTotalElement(element: GoogleAppsScript.Document.Element): boolean {
    return (
      element.getType() == this.documentApp.ElementType.LIST_ITEM &&
      (<GoogleAppsScript.Document.Paragraph>element).getText().substr(0, 5) == 'Total');
  }

  updateTotalElement(totalElement: GoogleAppsScript.Document.ListItem, runningTotal: Nutrients) {
    totalElement.setText('Total\t' + this.nutrientsToDisplay.map(nutrientId => runningTotal[nutrientId].toFixed(0)).join('\t'));
  }
}
