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
import * as firebase from "firebase";

import { IngredientDatabase } from "../core/IngredientDatabase";
import { NutrientInfo } from "../core/Nutrients";
import { IngredientIdentifier, FoodRef } from "../core/FoodRef";
import { Food } from "../core/Food";
import { searchFdcFoodsUrl, FDCQueryResult, getFdcFoodUrl, BrandedFood } from "../core/FoodDataCentral";
import { FDC_API_KEY } from "./config";
import { version } from "punycode";

export class IngredientDatabaseImpl implements IngredientDatabase {
  getNutrientInfo(): Promise<NutrientInfo[]> {
    let settings = firebase.firestore().collection('settings')
    let nutrients = settings.doc('nutrients').get();
    return nutrients.then(documentData => JSON.parse(documentData.data()?.value));
  } 

  getFood(ingredientIdentifier: IngredientIdentifier): Promise<Food | null> {
    return this.documentForIngredient(ingredientIdentifier)
    .get()
    .then(documentData => {
      let data = documentData.data();
      if (data) {
        return <Food>JSON.parse(data.data);
      } else if (ingredientIdentifier.identifierType == 'FdcId') {
        let result : Promise<Food> = fetch(getFdcFoodUrl(ingredientIdentifier.fdcId, FDC_API_KEY))
        .then(result => result.json());
        result.then(food => this.patchFood(ingredientIdentifier, food));
        return result;
      } else {
        return null;
      }
    });
  }

  patchFood(ingredientIdentifier: IngredientIdentifier, food: Food): Promise<void> {
    return this.documentForIngredient(ingredientIdentifier).set({
      data: JSON.stringify(food),
      version: '0.1',
    });
  }

  async insertFood(food: Food): Promise<IngredientIdentifier> {
    const documentReference = await firebase.firestore().collection('userData').add({
      data: JSON.stringify(food),
      version: '0.1',
    });
    return {
      identifierType: 'BookmarkId',
      bookmarkId: documentReference.id,
    };
  }

  private documentForIngredient(ingredientIdentifier: IngredientIdentifier): firebase.firestore.DocumentReference<firebase.firestore.DocumentData> {
    switch (ingredientIdentifier.identifierType) {
      case 'BookmarkId':
        return firebase.firestore().collection('userData').doc(ingredientIdentifier.bookmarkId);
      case 'FdcId':
        return firebase.firestore().collection('fdcData').doc(ingredientIdentifier.fdcId.toString());
    }
  }

  searchFoods(query: string): Promise<FoodRef[]> {
    let customFoods = firebase.firestore().collection('userData').get().then(documentData => {
      return documentData.docs
      .map(document => ({
        id: document.id,
        food: <Food>JSON.parse(document.data().data),
      }))
      .filter(data => data.food.description.match(query))
      .map(data => <FoodRef>({
        identifier: {identifierType: 'BookmarkId', bookmarkId:  data.id},
        description: data.food.description,
      }));
    });
    let queryResult = fetch(searchFdcFoodsUrl(query, FDC_API_KEY))
    .then(result => result.json())
    .then((queryResult: FDCQueryResult) => queryResult.foods.map(entry => <FoodRef>({
        identifier: {identifierType: 'FdcId', fdcId: entry.fdcId},
        description: entry.description,
      })));
    return Promise.all([customFoods, queryResult])
    .then(results => results[0].concat(results[1]));
  }

  addIngredient(ingredientIdentifier: IngredientIdentifier, amount: number, unit: string, description: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}