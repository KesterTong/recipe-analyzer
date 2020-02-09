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
import { FoodLink } from './core/FoodLink';
import { FdcAdaptor } from './appsscript/FdcAdaptor';
import { FirebaseAdaptor } from './appsscript/FirebaseAdaptor';
import { foodToDocument } from './firebase/foodToDocument';
import { documentToFood } from './firebase/documentToFood';

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

  addCustomFood(bookmarkId: string, food: Food) {
    let document = foodToDocument(food);
    this.firebaseAdaptor.patchDocument('userData/' + bookmarkId, document);
  }

  getFoodDetails(url: string): Food | null {
    let fdcIdMatch = url.match('^https://(?:[^/]*)(?:[^\\d]*)(\\d*)');
    let bookmarkIdMatch = url.match('^#bookmark=(.*)');
    if (fdcIdMatch) {
      let fdcId = Number(fdcIdMatch[1]);
      return this.getFdcFood(fdcId);
    } else if (bookmarkIdMatch) {
      let bookmarkId = bookmarkIdMatch[1];
      return this.getCustomFood(bookmarkId);
    } else {
      return null;
    }
  }

  private getCustomFood(bookmarkId: string): Food | null {
    let document = this.firebaseAdaptor.getDocument('userData/' + bookmarkId);
    if (document == null) {
      return null;
    }
    return documentToFood(document); 
  }

  private getFdcFood(fdcId: number): Food | null {
    let cachedFood = this.getFirebaseFood(fdcId);
    if (cachedFood != null) {
      return cachedFood;
    }
    let food = this.fdcAdaptor.getFdcFood(fdcId);
    this.putFirebaseFood(fdcId, food);
    return food;
  }

  private getFirebaseFood(fdcId: number): Food | null {
    let document = this.firebaseAdaptor.getDocument('fdcData/' + fdcId.toString());
    if (document == null) {
      return null;
    }
    return documentToFood(document);
  }

  private putFirebaseFood(fdcId: number, food: Food) {
    let document = foodToDocument(food);
    this.firebaseAdaptor.patchDocument('fdcData/' + fdcId.toString(), document);
  }

  searchFoods(query: string, includeBranded: boolean): FoodLink[] {
    let result: FoodLink[] = [];

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
          url: '#bookmark=' + bookmarkId,
          description: food.description,
        })
      });
    }
    let queryResult = this.fdcAdaptor.searchFdcFoods(query, includeBranded);
    queryResult.foods.forEach(entry => {
      result.push({
        url: 'https://fdc.nal.usda.gov/fdc-app.html#/food-details/' + entry.fdcId + '/nutrients',
        description: entry.description,
      });
    });
    return result;
  }
}