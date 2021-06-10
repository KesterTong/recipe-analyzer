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

import {
  Food,
  StatusOr,
  StatusCode,
  status,
  CanonicalizeQuantityConfig,
} from "../core";
import { normalizeFDCFood } from "./normalizeFdcFood";
import { fdcApiUrl } from "./fdcApiUrl";
import { FdcConfig } from "./FdcConfig";

function getFdcFoodUrl(fdcId: number, fdcApiKey: string): string {
  return fdcApiUrl(fdcId.toString(), fdcApiKey, {});
}

// Detects any URL for a page in the FDC Web App for a given food.
const FDC_WEB_URL_REGEX = /https:\/\/fdc\.nal\.usda\.gov\/fdc-app\.html#\/food-details\/(\d*)\/(?:.*)/;

async function fetchFdcFoodInternal(
  fdcId: number,
  config: FdcConfig
): Promise<StatusOr<Food>> {
  const response = await fetch(getFdcFoodUrl(fdcId, config.fdcApiKey));
  const json = await response.json();
  if (json.error) {
    return status(
      StatusCode.FDC_API_ERROR,
      "Error fetching FDC food: " + fdcId
    );
  }
  return normalizeFDCFood(json, config);
}

export function fetchFdcFood(
  url: string,
  config: FdcConfig
): Promise<StatusOr<Food>> | null {
  const match = FDC_WEB_URL_REGEX.exec(url);
  if (match === null) {
    return null;
  }
  return fetchFdcFoodInternal(Number(match[1]), config);
}
