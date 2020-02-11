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
import { DocumentAdaptor, IngredientItemAdaptor } from './appsscript/DocumentAdaptor';
import { parseQuantity } from './core/parseQuantity';

export class RecipeAnalyzer {
  private nutrientsToDisplay: number[];
  
  constructor(
      private documentAdaptor: DocumentAdaptor,
      private fdcClient: IngredientDatabase,
      propertiesService: GoogleAppsScript.Properties.PropertiesService) {
    let json = propertiesService.getScriptProperties().getProperty('DISPLAY_NUTRIENTS')
    // TODO: nutrientsToDisplay == [] should be an error.
    this.nutrientsToDisplay = json == null ? [] : JSON.parse(json);
  }

  private parseIngredient(adaptor: IngredientItemAdaptor): Nutrients | null {
    let parseResult = adaptor.parse();
    if (parseResult == null) {
      return null;
    }
    let quantity = parseQuantity(parseResult.quantityText);
    if (quantity == null) {
      return null;
    }
    let foodPath: string;
    let fdcIdMatch = parseResult.ingredientUrl.match('^https://(?:[^/]*)(?:[^\\d]*)(\\d*)');
    let bookmarkIdMatch = parseResult.ingredientUrl.match('^#bookmark=(.*)');
    if (fdcIdMatch != null) {
      foodPath = 'fdcData/' + fdcIdMatch[1];
    } else if (bookmarkIdMatch != null) {
      foodPath = 'userData/' + bookmarkIdMatch[1];
    } else {
      return null;
    }

    let foodDetails = this.fdcClient.getFood(foodPath);
    if (foodDetails == null) {
      return null;
    }
    let foodData = normalizeFood(foodDetails, this.nutrientsToDisplay);
    if (foodData == null) {
      return null;
    }
    return nutrientsForQuantity(quantity, foodData);
  }

  private updateIngredient(adaptor: IngredientItemAdaptor, nutrients: Nutrients | null, nutrientsToDisplay: number[]) {
    adaptor.update(nutrientsToDisplay.map(
      nutrientId => nutrients == null ? '-' : nutrients[nutrientId].toFixed(0)));
  }

  updateElement(adaptor: IngredientItemAdaptor): Nutrients {
    let nutrients = this.parseIngredient(adaptor);
    this.updateIngredient(adaptor, nutrients, this.nutrientsToDisplay);
    return nutrients || {};
  }

  updateDocument() {
    this.documentAdaptor.recipes().forEach(recipeAdaptor => {
      let nutrientsPerServing: Nutrients = {}
      recipeAdaptor.ingredients.forEach(adaptor => {
        let nutrients = this.updateElement(adaptor);
        nutrientsPerServing = addNutrients(nutrientsPerServing, nutrients);
      });
      this.updateTotalElement(recipeAdaptor.totalElement, nutrientsPerServing);
      if (recipeAdaptor.bookmarkId != null) {
        this.fdcClient.patchFood('userData/' + recipeAdaptor.bookmarkId, {
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

  updateTotalElement(adaptor: IngredientItemAdaptor, runningTotal: Nutrients) {
    adaptor.update(this.nutrientsToDisplay.map(nutrientId => runningTotal[nutrientId].toFixed(0)));
  }
}
