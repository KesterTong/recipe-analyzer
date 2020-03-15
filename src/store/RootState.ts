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
import { SRLegacyFood } from "../../core/FoodDataCentral";
import { Recipe } from "../../core/Recipe";
import { NormalizedFood } from "../../core/NormalizedFood";
import { NutrientInfo } from "../../core/Nutrients";
import { BrandedFoodState } from "./branded_food/types";
import { RecipeState } from "./recipe/types";

export interface LoadingFood {
  dataType: 'Loading',
  description: string | null,
}

export interface RootState {
  selectedFoodId: string | null,
  deselected: boolean,
  food: SRLegacyFood | RecipeState | BrandedFoodState | LoadingFood | null,
  nutrientInfos: NutrientInfo[] | null,
}
