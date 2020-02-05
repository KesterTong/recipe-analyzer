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

import { FoodDetails } from './core/FoodDetails';

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

export interface FoodIdentifier {
  fdcId?: number,
  bookmarkId?: string,
}

/**
 * Client for USDA Food Data Central database.
 * 
 * This database provides food data from a variety of sources.
 */
export class FDCClient {
  private localFoodDetailsByBookmarkId: {[index: string]: FoodDetails} = {};

  constructor(
      private urlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp,
      private cacheService: GoogleAppsScript.Cache.CacheService,
      private propertiesService: GoogleAppsScript.Properties.PropertiesService) {}

  addLocalFood(bookmarkId: string, foodDetails: FoodDetails) {
    this.localFoodDetailsByBookmarkId[bookmarkId] = foodDetails;
  }

  // TODO: handle API call failures gracefully.
  getFoodDetails(foodIdentifier: FoodIdentifier): FoodDetails {
    // Ensure that fdcId is all digits.
    if (foodIdentifier.bookmarkId != null) {
      return this.localFoodDetailsByBookmarkId[foodIdentifier.bookmarkId] || null;
    }
    let fdcId = foodIdentifier.fdcId.toString();
    let cache = this.cacheService.getUserCache();
    let response = cache.get(fdcId);
    if (response != null) {
      // Keep the item alive in the cache.
      cache.put(fdcId, response, 21600);
      return JSON.parse(response);
    }
    let url = this.fdcApiUrl(fdcId, {});
    response = this.urlFetchApp.fetch(url).getContentText();
    // Add to cache for 6 hours (maximum ttl allowed).
    cache.put(fdcId, response, 21600);
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