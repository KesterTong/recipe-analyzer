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

import { fetchOffFood } from "./fetchOffFood";
import { DataSource } from "../core";
import { OffConfig, OffNutrient } from "./OffConfig";
import { makeOffWebUrl } from "./makeOffWebUrl";

const UPC_OR_EAN_REGEX = /^\d{12,13}$/;

export const dataSource: DataSource<OffConfig> = {
  fetchFood: fetchOffFood,
  searchFoods: () => Promise.resolve([]),
  maybeUrlFromDescription: (description) => {
    if (!UPC_OR_EAN_REGEX.test(description)) {
      return null;
    }
    return makeOffWebUrl(description);
  },
};

export { OffConfig, OffNutrient };
