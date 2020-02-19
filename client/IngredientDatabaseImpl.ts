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

import { IngredientDatabase } from "../client/IngredientDatabase";
import { NutrientInfo } from "../core/Nutrients";
import { IngredientIdentifier, FoodRef } from "../core/FoodRef";
import { Food } from "../core/Food";

export class IngredientDatabaseImpl implements IngredientDatabase {
  getNutrientInfo(): Promise<NutrientInfo[]> {
    let settings = firebase.firestore().collection('settings')
    let nutrients = settings.doc('nutrients').get();
    return nutrients.then(documentData => JSON.parse(documentData.data()?.value));
  } 
  getFood(ingredientIdentifier: IngredientIdentifier): Promise<Food | null> {
    switch (ingredientIdentifier.identifierType) {
      case 'BookmarkId':
        return firebase.firestore()
        .collection('userData')
        .doc(ingredientIdentifier.bookmarkId)
        .get()
        .then(documentData => <Food>JSON.parse(documentData.data()?.data));
      case 'FdcId':
        throw new Error("Method not implemented.");
    }
  }
  patchFood(ingredientIdentifier: IngredientIdentifier, food: Food): Promise<void> {
    throw new Error("Method not implemented.");
  }
  searchFoods(query: string): Promise<FoodRef[]> {
    let customFoods =  firebase.firestore().collection('userData').get();
    return customFoods.then(documentData => {
      return documentData.docs
      .map(document => ({
        id: document.id,
        food: <Food>JSON.parse(document.data().data),
      }))
      .filter(data => data.food.description.match(query))
      .map(data => ({
        identifier: {identifierType: 'BookmarkId', bookmarkId:  data.id},
        description: data.food.description,
      }));
    });
  }
  addIngredient(ingredientIdentifier: IngredientIdentifier, amount: number, unit: string, description: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}