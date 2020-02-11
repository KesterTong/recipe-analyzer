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

  patchFood(documentPath: string, food: Food) {
    let document = foodToDocument(food);
    this.firebaseAdaptor.patchDocument(documentPath, document);
  }

  getFood(documentPath: string): Food | null {
    let document = this.firebaseAdaptor.getDocument(documentPath);
    if (document == null) {
      let fdcIdMatch = documentPath.match('^fdcData/(.*)');
      if (fdcIdMatch == null) {
        return null;
      } else {
        let food = this.fdcAdaptor.getFdcFood(Number(fdcIdMatch[1]));
        this.patchFood(documentPath, food);
        return food;
      }
    } else {
      return documentToFood(document);
    }
  }

  searchFoods(query: string): FoodLink[] {
    let result: FoodLink[] = [];

    let localQueryResults = this.firebaseAdaptor.listDocuments('userData');
    if (localQueryResults != null) {
      localQueryResults.documents.forEach(element => {
        let food = documentToFood(element);
        if (food == null || !food.description.match(query)) {
          return;
        }
        // TODO: clean this up.
        let components = element.name!.split('/');
        let documentPath = components[components.length - 2] + '/' + components[components.length - 1];
        result.push({
          documentPath: documentPath,
          description: food.description,
        })
      });
    }
    let queryResult = this.fdcAdaptor.searchFdcFoods(query);
    queryResult.foods.forEach(entry => {
      result.push({
        documentPath: 'fdcData/' + entry.fdcId,
        description: entry.description,
      });
    });
    return result;
  }
}