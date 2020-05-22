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

import { makeFdcWebUrl } from "./makeFdcWebUrl";

// Detects any URL for a page in the FDC Web App for a given food.
//
// Note that this includes non-canonical URLs that can't be used internally
// to represent a food.
const FDC_WEB_URL_REGEX = /https:\/\/fdc\.nal\.usda\.gov\/fdc-app\.html#\/food-details\/(\d*)\/(?:.*)/;

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
  const match = FDC_WEB_URL_REGEX.exec(description);
  if (match === null) {
    return null;
  }
  return makeFdcWebUrl(match[1]);
}
