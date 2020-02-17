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
import { IngredientDatabase } from './core/IngredientDatabase';
import { normalizeFood } from './core/normalizeFood';
import { DocumentAdaptor, IngredientItemAdaptor } from './appsscript/DocumentAdaptor';
import { parseQuantity } from './core/parseQuantity';
import { IngredientIdentifier } from './core/FoodRef';
import { Ingredient } from './core/Recipe';

export class RecipeAnalyzer {
  private nutrientsToDisplay: number[];
  
  constructor(
      private documentAdaptor: DocumentAdaptor,
      private ingredientDatabase: IngredientDatabase) {
    this.nutrientsToDisplay = ingredientDatabase
    .getNutrientInfo()
    .filter(nutrientInfo => nutrientInfo.display)
    .map(nutrientInfo => nutrientInfo.id);  
  }

  private parseIngredient(adaptor: IngredientItemAdaptor): Ingredient | null {
    let parseResult = adaptor.parse();
    if (parseResult == null) {
      return null;
    }
    let quantity = parseQuantity(parseResult.quantityText);
    if (quantity == null) {
      return null;
    }
    let ingredientIdentifier: IngredientIdentifier;
    let fdcIdMatch = parseResult.ingredientUrl.match('^https://(?:[^/]*)(?:[^\\d]*)(\\d*)');
    let bookmarkIdMatch = parseResult.ingredientUrl.match('^#bookmark=(.*)');
    if (fdcIdMatch != null) {
      ingredientIdentifier = {
        identifierType: 'FdcId',
        fdcId: Number(fdcIdMatch[1]),
      }
    } else if (bookmarkIdMatch != null) {
      ingredientIdentifier = {
        identifierType: 'BookmarkId',
        bookmarkId: bookmarkIdMatch[1],
      }
    } else {
      return null;
    }

    let foodDetails = this.ingredientDatabase.getFood(ingredientIdentifier);
    if (foodDetails == null) {
      return null;
    }
    let foodData = normalizeFood(foodDetails, this.nutrientsToDisplay);
    if (foodData == null) {
      return null;
    }
    let nutrients = nutrientsForQuantity(quantity, foodData);
    if (nutrients == null) {
      return null;
    }
    return {
      quantity: quantity,
      foodLink: {
        identifier: ingredientIdentifier,
        description: foodDetails.description,
      },
      nutrients: nutrients,
    }
  }

  private updateIngredient(adaptor: IngredientItemAdaptor, nutrients: Nutrients | null, nutrientsToDisplay: number[]) {
    adaptor.update(nutrientsToDisplay.map(
      nutrientId => nutrients == null ? '-' : nutrients[nutrientId].toFixed(0)));
  }

  updateElement(adaptor: IngredientItemAdaptor): Ingredient | null {
    let ingredient = this.parseIngredient(adaptor);
    this.updateIngredient(adaptor, ingredient?.nutrients || null, this.nutrientsToDisplay);
    return ingredient;
  }

  updateDocument() {
    this.documentAdaptor.recipes().forEach(recipeAdaptor => {
      let nutrientsPerServing: Nutrients = {}
      let ingredientsList: Ingredient[] = []
      recipeAdaptor.ingredients.forEach(adaptor => {
        let ingredient = this.updateElement(adaptor);
        if (ingredient != null) {
          nutrientsPerServing = addNutrients(nutrientsPerServing, ingredient.nutrients);
          ingredientsList.push(ingredient);
        }
      });
      this.updateTotalElement(recipeAdaptor.totalElement, nutrientsPerServing);
      if (recipeAdaptor.bookmarkId != null) {
        this.ingredientDatabase.patchFood({
          identifierType: 'BookmarkId',
          bookmarkId: recipeAdaptor.bookmarkId,
        }, {
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
