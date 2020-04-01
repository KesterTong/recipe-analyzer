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

import { Nutrients } from "./Nutrients";

export interface BrandedFood {
  dataType: "Branded";
  description: string;
  servingSize: number;
  servingSizeUnit: string;
  householdServingFullText?: string;
  foodNutrients: {
    nutrient: { id: number };
    amount?: number;
  }[];
  ingredients?: string;
  brandOwner?: string;
}

export interface SRLegacyFood {
  dataType: "SR Legacy";
  description: string;
  foodNutrients: {
    nutrient: { id: number };
    amount?: number;
  }[];
  foodPortions: {
    modifier: string;
    gramWeight: number;
    amount: number;
  }[];
}

export type FDCFood = BrandedFood | SRLegacyFood;

// TODO: check if these fields are always present.
export interface FDCQueryFood {
  fdcId: number;
  description: string;
  dataType: string;
  gtinUpc: string;
  brandOwner: string;
  score: number;
};

export interface FDCQueryResult {
  foodSearchCriteria: {
    generalSearchInput: string;
    pageNumber: number;
    requireAllWords: boolean;
  };
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: FDCQueryFood[];
}

export function getFdcFoodUrl(fdcId: number, fdcApiKey: string): string {
  return fdcApiUrl(fdcId.toString(), fdcApiKey, {});
}

export function searchFdcFoodsUrl(query: string, fdcApiKey: string): string {
  return fdcApiUrl("search", fdcApiKey, {
    generalSearchInput: encodeURIComponent(query),
    includeDataTypeList: "SR%20Legacy,Branded",
  });
}

function fdcApiUrl(
  resource: string,
  fdcApiKey: string,
  options: { [index: string]: string }
): string {
  let url =
    "https://api.nal.usda.gov/fdc/v1/" +
    encodeURIComponent(resource) +
    "?api_key=" +
    fdcApiKey;
  Object.keys(options).forEach((key) => {
    url += "&" + key + "=" + options[key];
  });
  return url;
}

export function nutrientsPerServingForFDCFood(
  foodDetails: FDCFood,
  nutrientsToDisplay: number[]
): Nutrients {
  let nutrientsById: { [id: number]: number } = {};
  for (var i = 0; i < foodDetails.foodNutrients.length; i++) {
    var foodNutrient = foodDetails.foodNutrients[i];
    var nutrientId = foodNutrient.nutrient.id;
    var nutrientAmount = foodNutrient.amount || 0;
    // Only include nutrients that will be displayed, in order to reduce
    // the computational cost of adding up and scaling nutrients.
    if (nutrientsToDisplay.indexOf(nutrientId) != -1) {
      nutrientsById[nutrientId] = nutrientAmount;
    }
  }
  return nutrientsToDisplay.map((id) => nutrientsById[id] || 0);
}
