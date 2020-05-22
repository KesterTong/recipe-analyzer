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

import { FoodReference } from "./FoodReference";
import { Food } from "./Food";
import { ConversionData } from "./canonicalizeQuantity";
import { StatusOr, StatusCode, status } from "./StatusOr";
import { normalizeFDCFood } from "./normalizeFDCFood";
import { Recipe } from "./Recipe";

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
interface FDCQueryFood {
  fdcId: number;
  description: string;
  dataType: string;
  gtinUpc: string;
  brandOwner: string;
  score: number;
}

interface FDCQueryResult {
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

const FDC_WEB_URL_REGEX = /https:\/\/fdc\.nal\.usda\.gov\/fdc-app\.html#\/food-details\/(\d*)\/(?:.*)/;

/**
 * Parse a link to the FDC website as an FDC ID.
 *
 * @param url A URL to the FDC website
 * @returns The FDC ID or none if parsing fails.
 */
function parseFdcWebUrl(url: string): number | null {
  const match = FDC_WEB_URL_REGEX.exec(url);
  if (match == null) {
    return null;
  }
  return Number(match[1]);
}

function makeFdcWebUrl(fdcId: number): string {
  return (
    "https://fdc.nal.usda.gov/fdc-app.html#/food-details/" +
    fdcId +
    "/nutrients"
  );
}

/**
 * Rewrites a FoodReference or returns the input unchanged.
 *
 * This is used to take user-provided input (e.g. a URL or a UPC) and
 * convert it to a link.
 *
 * @param description The string to be rewritten
 * @returns The rewritten food reference or null.
 */
export function maybeRewriteFoodReference(description: string): string | null {
  // Detect links to FDC Web App.
  const fdcId = parseFdcWebUrl(description);
  if (fdcId === null) {
    return null;
  }
  return makeFdcWebUrl(fdcId);
}

export async function searchFdcFoods(
  query: string,
  fdcApiKey: string
): Promise<FoodReference[]> {
  const response = await fetch(searchFdcFoodsUrl(query, fdcApiKey));
  const result: FDCQueryResult = await response.json();
  return result.foods.map((entry) => ({
    description: entry.description,
    url: makeFdcWebUrl(entry.fdcId),
  }));
}

const FDC_API_KEY = "exH4sAKIf3z3hK5vzw3PJlL9hSbUCLZ2H5feMsVJ";

export async function fetchFdcFood(
  url: string,
  conversionData: ConversionData
): Promise<StatusOr<Food>> {
  const fdcId = parseFdcWebUrl(url);
  if (fdcId === null) {
    return status(StatusCode.FOOD_NOT_FOUND, "Did not recognize URL " + url);
  }
  const response = await fetch(getFdcFoodUrl(fdcId, FDC_API_KEY));
  const json = await response.json();
  if (json.error) {
    return status(
      StatusCode.FDC_API_ERROR,
      "Error fetching FDC food: " + fdcId
    );
  }
  return normalizeFDCFood(json, conversionData);
}

function getFdcFoodUrl(fdcId: number, fdcApiKey: string): string {
  return fdcApiUrl(fdcId.toString(), fdcApiKey, {});
}

function searchFdcFoodsUrl(query: string, fdcApiKey: string): string {
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
