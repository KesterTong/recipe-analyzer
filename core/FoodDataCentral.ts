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

/**
 * Serving size as printed on USDA label, e.g. "1 cup (220 g)" or "1 scoop (36 ml)".
 */
export interface HouseholdServing {
  servingSize: number,
  servingSizeUnit: string,
  householdServingFullText?: string,
}

export interface BrandedFood extends HouseholdServing {
  dataType: 'Branded',
  description: string,
  foodNutrients: {
    nutrient: {id: number},
    amount?: number,
  }[],
  ingredients?: string,
  brandOwner?: string,
}

export interface SRLegacyFood {
  dataType: 'SR Legacy',
  description: string,
  foodNutrients: {
    nutrient: {id: number},
    amount?: number,
  }[],
  foodPortions: {
    modifier: string,
    gramWeight: number,
    amount: number,
  }[],
}

export interface FDCQueryResult {
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

export function getFdcFoodUrl(fdcId: number, fdcApiKey: string): string {
  return fdcApiUrl(fdcId.toString(), fdcApiKey, {});
}

export function searchFdcFoodsUrl(query: string, fdcApiKey: string): string {
  return fdcApiUrl('search', fdcApiKey, {
    generalSearchInput: encodeURIComponent(query),
    includeDataTypeList: 'SR%20Legacy,Branded',
  });
}

function fdcApiUrl(resource: string, fdcApiKey: string, options: {[index: string]: string}): string {
  let url = 'https://api.nal.usda.gov/fdc/v1/' + encodeURIComponent(resource) + '?api_key=' + fdcApiKey;
  Object.keys(options).forEach(key => {
    url += '&' + key + '=' + options[key];
  })
  return url;
}

export type FDCFood = BrandedFood | SRLegacyFood;