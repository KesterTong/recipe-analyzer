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

import { Food } from './Food';
import { FoodRef, IngredientIdentifier } from './FoodRef';
import { Firebase, Document } from './Firebase';
import { FoodDataCentral } from './FoodDataCentral';
import { NutrientInfo } from './Nutrients';

/**
 * Class to store and lookup ingredients.
 * 
 * Looks up USDA Food Data Central database and stores and looks up local ingredients.
 */
export class IngredientDatabase {
  constructor(
      private fdc: FoodDataCentral,
      private firebase: Firebase) { }

  getNutrientInfo(): NutrientInfo[] {
    let document = this.firebase.getDocument('settings/nutrients');
    // TODO: handle null.
    return JSON.parse(document!.fields['value'].stringValue!);
  }
  
  patchFood(ingredientIdentifier: IngredientIdentifier, food: Food) {
    let documentPath = this.documentPathForIngredient(ingredientIdentifier);
    let document = this.foodToDocument(food);
    this.firebase.patchDocument(documentPath, document);
  }

  getFood(ingredientIdentifier: IngredientIdentifier): Food | null {
    let documentPath = this.documentPathForIngredient(ingredientIdentifier);
    let document = this.firebase.getDocument(documentPath);
    if (document == null && ingredientIdentifier.identifierType == 'FdcId') {
      let food = this.fdc.getFdcFood(ingredientIdentifier.fdcId);
      this.patchFood(ingredientIdentifier, food);
      return food;
    } else if (document == null) {
      return null;
    } else {
      return this.documentToFood(document);
    }
  }

  private documentPathForIngredient(ingredientIdentifier: IngredientIdentifier): string {
    switch (ingredientIdentifier.identifierType) {
      case 'BookmarkId':
        return 'userData/' + ingredientIdentifier.bookmarkId;
      case 'FdcId':
        return 'fdcData/' + ingredientIdentifier.fdcId.toString()
    }
  }

  private foodToDocument(food: Food): Document {
    return {
      fields: {
        version: {stringValue: '0.1'},
        data: {stringValue: JSON.stringify(food)},
      }
    };
  }

  private documentToFood(document: Document): Food | null {
    let version = document.fields.version;
    if (version == null || version.stringValue == null || version.stringValue != '0.1') {
      return null;
    }
    let data = document.fields.data;
    if (data == null || data.stringValue == null) {
      return null;
    }
    return JSON.parse(data.stringValue);
  }

  searchFoods(query: string): FoodRef[] {
    let result: FoodRef[] = [];

    let localQueryResults = this.firebase.listDocuments('userData');
    if (localQueryResults != null) {
      localQueryResults.documents.forEach(element => {
        let food = this.documentToFood(element);
        if (food == null || !food.description.match(query)) {
          return;
        }
        let components = element.name!.split('/');
        let bookmarkId = components[components.length - 1];
        result.push({
          identifier: {identifierType: 'BookmarkId', bookmarkId:  bookmarkId},
          description: food.description,
        })
      });
    }
    let queryResult = this.fdc.searchFdcFoods(query);
    queryResult.foods.forEach(entry => {
      result.push({
        identifier: {identifierType: 'FdcId', fdcId: entry.fdcId},
        description: entry.description,
      });
    });
    return result;
  }
}