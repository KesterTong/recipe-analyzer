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

import { FoodReference } from "../core";
import { makeFdcWebUrl } from "./makeFdcWebUrl";
import { fdcApiUrl } from "./fdcApiUrl";
import { FdcConfig } from "./FdcConfig";

interface FDCQueryResult {
  foodSearchCriteria: {
    generalSearchInput: string;
    pageNumber: number;
    requireAllWords: boolean;
  };
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: {
    fdcId: number;
    description: string;
  }[];
}

function searchFdcFoodsUrl(query: string, fdcApiKey: string): string {
  return fdcApiUrl("search", fdcApiKey, {
    generalSearchInput: encodeURIComponent(query),
    includeDataTypeList: "SR%20Legacy,Branded",
  });
}

export async function searchFdcFoods(
  query: string,
  config: FdcConfig
): Promise<FoodReference[]> {
  const response = await fetch(searchFdcFoodsUrl(query, config.fdcApiKey));
  const result: FDCQueryResult = await response.json();
  return result.foods.map((entry) => ({
    description: entry.description,
    url: makeFdcWebUrl(entry.fdcId),
  }));
}
