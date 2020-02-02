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

import { FoodData } from  './nutrients';
import { FoodDetails } from './core/FoodDetails';
import { convertFDCFoodDetailsToFoodData } from './convertFDCFoodDetailsToFoodData';

interface FDCQueryResult {
  foodSearchCriteria: {
    generalSearchInput: string,
    pageNumber: Number,
    requireAllWords: boolean
  },
  totalHits: Number,
  currentPage: Number,
  totalPages: Number,
  foods: {
    fdcId: Number,
    description: string,
    dataType: string,
    gtinUpc: string,
    brandOwner: string
    score: Number
  }[];
}

export interface SearchResult {
  fdcId: Number,
  description: string,
}

/**
 * Client for USDA Food Data Central database.
 * 
 * This database provides food data from a variety of sources.
 */
export class FDCClient {
  // TODO: handle API call failures gracefully.
  getFoodDetails(fdcId: string): FoodDetails {
    // Ensure that fdcId is all digits.
    if (!fdcId.match(/^\d+$/)) {
      return null;
    }
    let cache = CacheService.getUserCache();
    let response = cache.get(fdcId);
    if (response != null) {
      // Keep the item alive in the cache.
      cache.put(fdcId, response, 21600);
      return JSON.parse(response);
    }
    let url = fdcApiUrl(fdcId, {});
    response = UrlFetchApp.fetch(url).getContentText();
    // Add to cache for 6 hours (maximum ttl allowed).
    cache.put(fdcId, response, 21600);
    return JSON.parse(response);
  }

  getFoodData(fdcId: string): FoodData {
    let foodDetails = this.getFoodDetails(fdcId);
    if (foodDetails == null) {
      return null;
    }
    return convertFDCFoodDetailsToFoodData(foodDetails);
  }

  searchFoods(query: string, includeBranded: boolean): SearchResult[] {
    let url = fdcApiUrl('search', {
      generalSearchInput: encodeURIComponent(query),
      includeDataTypeList: includeBranded ? 'SR%20Legacy,Branded' : 'SR%20Legacy',
    });
    let result = <FDCQueryResult>JSON.parse(UrlFetchApp.fetch(url).getContentText());
    return result.foods.map(details => {
      return {
        fdcId: details.fdcId,
        description: details.description,
      };
    });
  }
}

function fdcApiUrl(resource: string, options: {[index: string]: string}): string {
  const API_KEY = PropertiesService.getScriptProperties().getProperty('USDA_API_KEY');
  let url = 'https://api.nal.usda.gov/fdc/v1/';
  url += encodeURIComponent(resource);
  url += '?api_key=' + API_KEY;
  Object.keys(options).forEach(key => {
    url += '&' + key + '=' + options[key];
  })
  return url;
}
