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
import { FDCFoodDetails } from './FDCFoodDetails';
import { convertFDCFoodDetailsToFoodData } from './convertFDCFoodDetailsToFoodData';

/**
 * Client for USDA Food Data Central database.
 * 
 * This database provides food data from a variety of sources.
 */
export class FDCClient {
  getFoodData(fdcId: string): FoodData {
    let foodDetails = getFoodDetails(fdcId);
    if (foodDetails == null) {
      return null;
    }
    return convertFDCFoodDetailsToFoodData(foodDetails);
  }
}

// TODO: handle API call failures gracefully.
function getFoodDetails(fdcId: string): FDCFoodDetails {
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
  const API_KEY = PropertiesService.getScriptProperties().getProperty('USDA_API_KEY');
  let url = "https://api.nal.usda.gov/fdc/v1/" + encodeURIComponent(fdcId) + "?api_key=" + API_KEY;
  response = UrlFetchApp.fetch(url).getContentText();
  // Add to cache for 6 hours (maximum ttl allowed).
  cache.put(fdcId, response, 21600);
  return JSON.parse(response);
}
