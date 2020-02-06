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

import { FDCFood } from './core/FoodDetails';

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

export interface SearchResult {
  fdcId: number,
  description: string,
}

export interface FDCFoodIdentifier {
  foodType: 'FDC Food',
  fdcId: number,
}

export interface LocalFoodIdentifier {
  foodType: 'Local Food',
  bookmarkId: string,
}

export type FoodIdentifier = FDCFoodIdentifier | LocalFoodIdentifier;

/**
 * Client for USDA Food Data Central database.
 * 
 * This database provides food data from a variety of sources.
 */
export class FDCClient {
  private localFoodDetailsByBookmarkId: {[index: string]: FDCFood} = {};

  constructor(
      private urlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp,
      private cacheService: GoogleAppsScript.Cache.CacheService,
      private propertiesService: GoogleAppsScript.Properties.PropertiesService) {}

  addLocalFood(bookmarkId: string, foodDetails: FDCFood) {
    this.localFoodDetailsByBookmarkId[bookmarkId] = foodDetails;
  }

  getCustomFoods(): FDCFood[] {
    let result: FDCFood[] = [];
    for (let bookmarkId in this.localFoodDetailsByBookmarkId) {
      result.push(this.localFoodDetailsByBookmarkId[bookmarkId]);
    }
    return result;
  }

  // TODO: handle API call failures gracefully.
  getFoodDetails(foodIdentifier: FoodIdentifier): FDCFood | null{
    switch (foodIdentifier.foodType) {
      case 'FDC Food':
        return this.FDCFoodDetails(foodIdentifier.fdcId);
      case 'Local Food':
        return this.localFoodDetailsByBookmarkId[foodIdentifier.bookmarkId] || null;
    }
  }

  FDCFoodDetails(fdcId: number): FDCFood | null {
    let fdcIdString = fdcId.toString();
    let cache = this.cacheService.getUserCache();
    if (cache == null) {
      return null;
    }
    let response = cache.get(fdcIdString);
    if (response != null) {
      // Keep the item alive in the cache.
      cache.put(fdcIdString, response, 21600);
      return JSON.parse(response);
    }
    let url = this.fdcApiUrl(fdcIdString, {});
    response = this.urlFetchApp.fetch(url).getContentText();
    // Add to cache for 6 hours (maximum ttl allowed).
    cache.put(fdcIdString, response, 21600);
    return JSON.parse(response);
  }

  searchFoods(query: string, includeBranded: boolean): SearchResult[] {
    let url = this.fdcApiUrl('search', {
      generalSearchInput: encodeURIComponent(query),
      includeDataTypeList: includeBranded ? 'SR%20Legacy,Branded' : 'SR%20Legacy',
    });
    let result = <FDCQueryResult>JSON.parse(this.urlFetchApp.fetch(url).getContentText());
    return result.foods.map(details => {
      return {
        fdcId: details.fdcId,
        description: details.description,
      };
    });
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