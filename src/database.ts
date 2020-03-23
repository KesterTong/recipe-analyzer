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

import { NutrientInfo } from "../core/Nutrients";
import { FoodRef } from "../core/FoodRef";
import { Food } from "../core/Food";
import {
  searchFdcFoodsUrl,
  FDCQueryResult,
  getFdcFoodUrl,
} from "../core/FoodDataCentral";
import { FDC_API_KEY } from "./config";

export async function getNutrientInfo(): Promise<NutrientInfo[]> {
  let settings = firebase.firestore().collection("settings");
  let documentData = await settings.doc("nutrients").get();
  return JSON.parse(documentData.data()?.value);
}

export async function getFood(foodId: string): Promise<Food | null> {
  const documentData = await firebase.firestore().doc(foodId).get();
  let data = documentData.data();
  if (data) {
    return <Food>JSON.parse(data.data);
  }
  if (!foodId.startsWith("fdcData/")) {
    return null;
  }
  let fdcId = Number(foodId.substr(8, foodId.length - 8));
  let foodData = await fetch(getFdcFoodUrl(fdcId, FDC_API_KEY));
  let result = foodData.json();
  result.then((food) => patchFood(foodId, food));
  return result;
}

export function patchFood(foodId: string, food: Food): Promise<void> {
  return firebase
    .firestore()
    .doc(foodId)
    .set({
      data: JSON.stringify(food),
      version: "0.1",
    });
}

export async function insertFood(food: Food): Promise<string> {
  const documentReference = await firebase
    .firestore()
    .collection("userData")
    .add({
      data: JSON.stringify(food),
      version: "0.1",
    });
  return documentReference.path;
}

async function searchCustomFoods(query: string): Promise<FoodRef[]> {
  let documentData = await firebase.firestore().collection("userData").get();
  return documentData.docs
    .map((document) => ({
      foodId: document.ref.path,
      food: <Food>JSON.parse(document.data().data),
    }))
    .filter((data) => data.food.description.match(query))
    .map(
      (data) =>
        <FoodRef>{
          foodId: data.foodId,
          description: data.food.description,
        }
    );
}

async function searchFdcFoods(query: string): Promise<FoodRef[]> {
  let result = await fetch(searchFdcFoodsUrl(query, FDC_API_KEY));
  let queryResult = (await result.json()) as FDCQueryResult;
  return queryResult.foods.map(
    (entry) =>
      <FoodRef>{
        foodId: "fdcData/" + entry.fdcId.toString(),
        description: entry.description,
      }
  );
}

export async function searchFoods(query: string): Promise<FoodRef[]> {
  let customFoods = searchCustomFoods(query);
  let queryResult = searchFdcFoods(query);
  const results = await Promise.all([customFoods, queryResult]);
  return results[0].concat(results[1]);
}
