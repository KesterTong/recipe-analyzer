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
import { Nutrients, addNutrients } from "./core/Nutrients";
import { FoodData } from "./core/FoodData";
import { parseIngredient, updateIngredient, ParsedIngredient } from './parseIngredient';
import { FDCClient } from './FDCClient';
import { LocalIngredients } from './LocalIngredients';
import { foodDetailsToFoodData } from './core/foodDetailsToFoodData';

export class RecipeAnalyzer {
  
  constructor(
    private localIngredients: LocalIngredients,
    private fdcClient: FDCClient) {
  }

  private computeNutrients(ingredient: ParsedIngredient): Nutrients {
    if (ingredient.id == null) {
      return null;
    }
    let foodData: FoodData;
    if (ingredient.id.fdcId != null) {
      let foodDetails = this.fdcClient.getFoodDetails(ingredient.id.fdcId);
      if (foodDetails == null) {
        return null;
      }
      foodData = foodDetailsToFoodData(foodDetails);
    } else {
      foodData = this.localIngredients.getFoodData(ingredient.id.bookmarkId);
    }
    if (foodData == null) {
      return null;
    }
    return nutrientsForQuantity(ingredient.quantity, foodData);
  }

  updateElement(element: GoogleAppsScript.Document.ListItem): Nutrients {
    // If numChildren != 1, skip this element as it's too complicated
    if (element.getNumChildren() != 1) {
      return {};
    }
    let childElement = element.getChild(0);
    if (childElement.getType() != DocumentApp.ElementType.TEXT) {
      return {};
    }
    let textElement = <GoogleAppsScript.Document.Text>childElement;
    let ingredient = parseIngredient(textElement);
    let nutrients: Nutrients = null;
    if (ingredient != null) {
      nutrients = this.computeNutrients(ingredient)
    }
    updateIngredient(textElement, nutrients);
    return nutrients || {};
  }

  updateDocument(document: GoogleAppsScript.Document.Document) {
    enum State {
      LOOKING_FOR_RECIPE,
      LOOKING_FOR_TITLE,
      INSIDE_RECIPE,
    }
    let state: State = State.LOOKING_FOR_RECIPE;
    let totalElement: GoogleAppsScript.Document.ListItem = null;
    let runningTotal = null;
    let body = document.getBody();
    for (let i = body.getNumChildren() - 1; i > 0; i--) {
      let element = body.getChild(i);
      // First we do a state transition to LOOKING_FOR_TITLE in the case
      // that the current element is not a list item.  This is so we can then
      // check if the current element is the title.
      if (state == State.INSIDE_RECIPE && element.getType() != DocumentApp.ElementType.LIST_ITEM) {
        this.updateTotalElement(totalElement, runningTotal);
        totalElement = null;
        state = State.LOOKING_FOR_TITLE;
      }
  
      let maybeBookmarkId: string;
      if (state == State.LOOKING_FOR_TITLE && (maybeBookmarkId = this.localIngredients.bookmarkIdForElement(element))) {
        this.localIngredients.insertFoodData(
          maybeBookmarkId,
          {
            description: element.asParagraph().getText(),
            nutrientsPerServing: runningTotal,
            servingEquivalentQuantities: {'serving': 1},
          });
        runningTotal = null;
        state = State.LOOKING_FOR_RECIPE;
      } else if ((state == State.LOOKING_FOR_RECIPE || State.LOOKING_FOR_TITLE) && this.isTotalElement(element)) {
        totalElement = element.asListItem();
        runningTotal = {calories: 0, protein: 0};
        state = State.INSIDE_RECIPE;
      } else if (state == State.INSIDE_RECIPE) {
        var nutrients = this.updateElement(element.asListItem());
        runningTotal = addNutrients(runningTotal, nutrients);
      }
    }
  }

  isTotalElement(element: GoogleAppsScript.Document.Element): boolean {
    return (
      element.getType() == DocumentApp.ElementType.LIST_ITEM &&
      (<GoogleAppsScript.Document.Paragraph>element).getText().substr(0, 5) == 'Total');
  }

  updateTotalElement(totalElement: GoogleAppsScript.Document.ListItem, runningTotal: Nutrients) {
    totalElement.setText('Total\t' + runningTotal.calories.toFixed(0) + '\t' + runningTotal.protein.toFixed(0));
  }
}
