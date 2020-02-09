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
import { FoodIdentifier, parseUrl, generateUrl } from './FoodIdentifier';
import { FirebaseAdaptor } from './appsscript/FirebaseAdaptor';
import { documentNameForFDCFood } from './firebase/documentNameFDCFood';
import { foodToDocument } from './firebase/foodToDocument';
import { documentToFood } from './firebase/documentToFood';

interface FDCQueryResult {
  foodSearchCriteria: {
    generalSearchInput: string,
    pageNumber: number,
    requireAllWords: boolean
  },
  totalHits: number,
  currentPage: number,
  totalPages: number,
  foods: {
    fdcId: number,
    description: string,
    dataType: string,
    gtinUpc: string,
    brandOwner: string
    score: number
  }[];
}

/**
 * Class to store and lookup ingredients.
 * 
 * Looks up USDA Food Data Central database and stores and looks up local ingredients.
 */
export class IngredientDatabase {
  private customFoodsByBookmarkId: {[index: string]: Food} = {};
  private firebaseAdaptor: FirebaseAdaptor;

  constructor(
      private urlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp,
      scriptApp: GoogleAppsScript.Script.ScriptApp,
      private propertiesService: GoogleAppsScript.Properties.PropertiesService,) {
    this.firebaseAdaptor = new FirebaseAdaptor(urlFetchApp, scriptApp, propertiesService);
  }

  addCustomFood(bookmarkId: string, foodDetails: Food) {
    this.customFoodsByBookmarkId[bookmarkId] = foodDetails;
  }

  saveCustomFoods() {
    this.propertiesService.getDocumentProperties().setProperty(
      'CUSTOM_FOODS', JSON.stringify(this.customFoodsByBookmarkId));
  }

  loadCustomFoods() {
    let json = this.propertiesService.getDocumentProperties().getProperty('CUSTOM_FOODS');
    this.customFoodsByBookmarkId =  json == null ? {} : JSON.parse(json);
  }

  // TODO: handle API call failures gracefully.
  getFoodDetails(url: string): Food | null {
    let foodIdentifier: FoodIdentifier | null = parseUrl(url);
    if (foodIdentifier == null) {
      return null;
    }
    switch (foodIdentifier.foodType) {
      case 'FDC Food':
        return this.FDCFoodDetails(foodIdentifier.fdcId);
      case 'Local Food':
        return this.customFoodsByBookmarkId[foodIdentifier.bookmarkId] || null;
    }
  }

  FDCFoodDetails(fdcId: number): Food | null {
    let cachedFood = this.getFirebaseFood(fdcId);
    if (cachedFood != null) {
      return cachedFood;
    }
    let url = this.fdcApiUrl(fdcId.toString(), {});
    let food: Food = JSON.parse(this.urlFetchApp.fetch(url).getContentText());
    this.putFirebaseFood(fdcId, food);
    return food;
  }

  private getFirebaseFood(fdcId: number): Food | null {
    let documentName = documentNameForFDCFood(fdcId);
    let document = this.firebaseAdaptor.getDocument(documentName);
    if (document == null) {
      return null;
    }
    return documentToFood(document);
  }

  private putFirebaseFood(fdcId: number, food: Food) {
    let documentName = documentNameForFDCFood(fdcId);
    let document = foodToDocument(food);
    this.firebaseAdaptor.patchDocument(documentName, document);
  }

  searchFoods(query: string, includeBranded: boolean): FoodLink[] {
    let url = this.fdcApiUrl('search', {
      generalSearchInput: encodeURIComponent(query),
      includeDataTypeList: includeBranded ? 'SR%20Legacy,Branded' : 'SR%20Legacy',
    });
    let result: FoodLink[] = [];
    for (let bookmarkId in this.customFoodsByBookmarkId) {
      let details = this.customFoodsByBookmarkId[bookmarkId];
      if (details.description.match(query)) {
        result.push({
          url: generateUrl({foodType: 'Local Food', bookmarkId: bookmarkId}),
          description: details.description,
        });
      }
    }
    let queryResult = <FDCQueryResult>JSON.parse(this.urlFetchApp.fetch(url).getContentText());
    queryResult.foods.forEach(entry => {
      result.push({
        url: generateUrl({foodType: 'FDC Food', fdcId: entry.fdcId}),
        description: entry.description,
      });
    });
    return result;
  }

  private fdcApiUrl(resource: string, options: {[index: string]: string}): string {
    const API_KEY = this.propertiesService.getScriptProperties().getProperty('USDA_API_KEY');
    let url = 'https://api.nal.usda.gov/fdc/v1/';
    url += encodeURIComponent(resource);
    url += '?api_key=' + API_KEY;
    Object.keys(options).forEach(key => {
      url += '&' + key + '=' + options[key];
    })
    return url;
  }
}