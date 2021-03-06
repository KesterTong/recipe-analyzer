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

import { FdcConfig } from "../food_data_central";
import { OffConfig, OffNutrient } from "../open_food_facts";

interface NutrientConfig extends OffNutrient {
  id: number;
  name: string;
}

/**
 * Configuration for the app.
 *
 * This currently doesn't distinguish between script-level, user-level
 * and document-level config.
 */
export interface Config extends FdcConfig, OffConfig {
  minCharsToQueryFDC: 3;
  nutrients: NutrientConfig[];
  numDigits: number;
}
