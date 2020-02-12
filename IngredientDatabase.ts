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

import { Food } from './core/Food';
import { FoodRef, IngredientIdentifier } from './core/FoodRef';
import { FdcAdaptor } from './appsscript/FdcAdaptor';
import { FirebaseAdaptor } from './appsscript/FirebaseAdaptor';
import { foodToDocument } from './firebase/foodToDocument';
import { documentToFood } from './firebase/documentToFood';
import { IngredientsTableAdaptor } from './appsscript/DocumentAdaptor';

/**
 * Class to store and lookup ingredients.
 * 
 * Looks up USDA Food Data Central database and stores and looks up local ingredients.
 */
export class IngredientDatabase {
  constructor(
      private fdcAdaptor: FdcAdaptor,
      private firebaseAdaptor: FirebaseAdaptor) { }
  
  static build(): IngredientDatabase {
    return new IngredientDatabase(FdcAdaptor.build(), FirebaseAdaptor.build());
  }

  patchFood(ingredientIdentifier: IngredientIdentifier, food: Food) {
    let documentPath = this.documentPathForIngredient(ingredientIdentifier);
    let document = foodToDocument(food);
    this.firebaseAdaptor.patchDocument(documentPath, document);
  }

  getFood(ingredientIdentifier: IngredientIdentifier): Food | null {
    let documentPath = this.documentPathForIngredient(ingredientIdentifier);
    let document = this.firebaseAdaptor.getDocument(documentPath);
    if (document == null && ingredientIdentifier.identifierType == 'FdcId') {
      let food = this.fdcAdaptor.getFdcFood(ingredientIdentifier.fdcId);
      this.patchFood(ingredientIdentifier, food);
      return food;
    } else if (document == null) {
      return null;
    } else {
      return documentToFood(document);
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

  searchFoods(query: string): FoodRef[] {
    let result: FoodRef[] = [];

    let localQueryResults = this.firebaseAdaptor.listDocuments('userData');
    if (localQueryResults != null) {
      localQueryResults.documents.forEach(element => {
        let food = documentToFood(element);
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
    let queryResult = this.fdcAdaptor.searchFdcFoods(query);
    queryResult.foods.forEach(entry => {
      result.push({
        identifier: {identifierType: 'FdcId', fdcId: entry.fdcId},
        description: entry.description,
      });
    });
    return result;
  }
}