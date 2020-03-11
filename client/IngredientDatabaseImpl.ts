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
import { FoodRef } from "../core/FoodRef";
import { Food } from "../core/Food";
import { searchFdcFoodsUrl, FDCQueryResult, getFdcFoodUrl, BrandedFood } from "../core/FoodDataCentral";
import { FDC_API_KEY } from "./config";

export class IngredientDatabaseImpl implements IngredientDatabase {
  getNutrientInfo(): Promise<NutrientInfo[]> {
    let settings = firebase.firestore().collection('settings')
    let nutrients = settings.doc('nutrients').get();
    return nutrients.then(documentData => JSON.parse(documentData.data()?.value));
  } 

  getFood(foodId: string): Promise<Food | null> {
    return firebase.firestore().doc(foodId)
    .get()
    .then(documentData => {
      let data = documentData.data();
      if (data) {
        return <Food>JSON.parse(data.data);
      } else if (foodId.startsWith('fdcData/')) {
        let fdcId = Number(foodId.substr(8, foodId.length - 8));
        let result : Promise<Food> = fetch(getFdcFoodUrl(fdcId, FDC_API_KEY))
        .then(result => result.json());
        result.then(food => this.patchFood(foodId, food));
        return result;
      } else {
        return null;
      }
    });
  }

  patchFood(foodId: string, food: Food): Promise<void> {
    return firebase.firestore().doc(foodId).set({
      data: JSON.stringify(food),
      version: '0.1',
    });
  }

  async insertFood(food: Food): Promise<string> {
    const documentReference = await firebase.firestore().collection('userData').add({
      data: JSON.stringify(food),
      version: '0.1',
    });
    return documentReference.path;
  }

  searchFoods(query: string): Promise<FoodRef[]> {
    let customFoods = firebase.firestore().collection('userData').get().then(documentData => {
      return documentData.docs
      .map(document => ({
        foodId: document.ref.path,
        food: <Food>JSON.parse(document.data().data),
      }))
      .filter(data => data.food.description.match(query))
      .map(data => <FoodRef>({
        foodId: data.foodId,
        description: data.food.description,
      }));
    });
    let queryResult = fetch(searchFdcFoodsUrl(query, FDC_API_KEY))
    .then(result => result.json())
    .then((queryResult: FDCQueryResult) => queryResult.foods.map(entry => <FoodRef>({
        foodId: 'fdcData/' + entry.fdcId.toString(),
        description: entry.description,
      })));
    return Promise.all([customFoods, queryResult])
    .then(results => results[0].concat(results[1]));
  }
}