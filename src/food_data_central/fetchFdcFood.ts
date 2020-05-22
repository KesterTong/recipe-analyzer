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

import { Food, ConversionData, StatusOr, StatusCode, status } from "../core";
import { normalizeFDCFood } from "./normalizeFdcFood";
import { fdcApiUrl } from "./fdcApiUrl";

// Detects a URL for a the main page in the FDC Web App for a given food.
//
// Note that this only includes canonical URLs, i.e. URLs that end in /nutrients,
// but not /measures.

const FDC_CANONICAL_WEB_URL_REGEX = /https:\/\/fdc\.nal\.usda\.gov\/fdc-app\.html#\/food-details\/(\d*)\/nutrients/;

/**
 * Parse a link to the FDC website as an FDC ID.
 *
 * @param url A URL to the FDC website
 * @returns The FDC ID or none if parsing fails.
 */
function parseFdcWebUrl(url: string): number | null {
  const match = FDC_CANONICAL_WEB_URL_REGEX.exec(url);
  if (match == null) {
    return null;
  }
  return Number(match[1]);
}

function getFdcFoodUrl(fdcId: number, fdcApiKey: string): string {
  return fdcApiUrl(fdcId.toString(), fdcApiKey, {});
}

export async function fetchFdcFood(
  url: string,
  fdcApiKey: string,
  conversionData: ConversionData
): Promise<StatusOr<Food>> {
  const fdcId = parseFdcWebUrl(url);
  if (fdcId === null) {
    return status(StatusCode.FOOD_NOT_FOUND, "Did not recognize URL " + url);
  }
  const response = await fetch(getFdcFoodUrl(fdcId, fdcApiKey));
  const json = await response.json();
  if (json.error) {
    return status(
      StatusCode.FDC_API_ERROR,
      "Error fetching FDC food: " + fdcId
    );
  }
  return normalizeFDCFood(json, conversionData);
}
