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

import { NutrientInfo } from "./store";
import { Food, searchFdcFoodsUrl, FDCQueryResult, getFdcFoodUrl } from "./core";
import { FDC_API_KEY } from "./config";
import { memoize } from "lodash";

export async function getNutrientInfo(): Promise<NutrientInfo[]> {
  let settings = firebase.firestore().collection("settings");
  let documentData = await settings.doc("nutrients").get();
  return JSON.parse(documentData.data()?.value);
}

const fetchJson = memoize(async (url: string) => {
  let response = await fetch(url);
  return response.json();
});

const customFoods: {[index: string]: Food} = {};

export async function getFood(foodId: string): Promise<Food> {
  if (foodId.startsWith("fdcData/")) {
    let fdcId = Number(foodId.substr(8, foodId.length - 8));
    return fetchJson(getFdcFoodUrl(fdcId, FDC_API_KEY));
  } else {
    const result = customFoods[foodId];
    if (result === undefined) {
      throw Error("Food ${foodId} not found");
    }
    return result;
  }
}

export async function patchFood(foodId: string, food: Food): Promise<void> {
  await firebase
    .firestore()
    .doc(foodId)
    .set({
      data: JSON.stringify(food),
      version: "0.1",
    });
  customFoods[foodId] = food;
}

export async function insertFood(food: Food): Promise<string> {
  const documentReference = await firebase
    .firestore()
    .collection("userData")
    .add({
      data: JSON.stringify(food),
      version: "0.1",
    });
  const foodId = documentReference.path;
  customFoods[foodId] = food;
  return foodId;
}

export interface QueryResult {
  foodId: string;
  description: string;
}

export async function loadCustomFoods(): Promise<void> {
  let documentData = await firebase.firestore().collection("userData").get();
  documentData.docs.forEach((document) => {
    customFoods[document.ref.path] = <Food>JSON.parse(document.data().data);
  });
}

async function searchCustomFoods(query: string): Promise<QueryResult[]> {
  const result: QueryResult[] = [];
  Object.keys(customFoods).map(foodId => {
    const food = customFoods[foodId];
    if (food.description.match(query)) {
      result.push({
        foodId,
        description: food.description,
      });
    }
  });
  return result;
}

async function searchFdcFoods(query: string): Promise<QueryResult[]> {
  let fdcQueryResult: FDCQueryResult = await fetchJson(
    searchFdcFoodsUrl(query, FDC_API_KEY)
  );
  return fdcQueryResult.foods.map((entry) => ({
    foodId: "fdcData/" + entry.fdcId.toString(),
    description: entry.description,
  }));
}

export async function searchFoods(query: string): Promise<QueryResult[]> {
  let customFoods = searchCustomFoods(query);
  let queryResult = searchFdcFoods(query);
  const results = await Promise.all([customFoods, queryResult]);
  return results[0].concat(results[1]);
}
