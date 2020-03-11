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

import { NutrientInfo } from "../core/Nutrients";
import { SRLegacyFood } from "../core/FoodDataCentral";
import { Recipe } from "../core/Recipe";
import { Food } from "../core/Food";

// When a food has been selected from an IngredientSearcher,
// we know its description but nothing else.
export interface LoadingFood {
  dataType: 'Loading',
  description: string,
}

export interface BrandedFoodEdits {
  dataType: 'Branded Edit',
  servingSize: string,
  servingSizeUnit: string,
  householdServingFullText: string,
  description: string,
  foodNutrients: {id: number, amount: string}[],
}

export interface RootState {
  foodId: string | null,
  food: SRLegacyFood | Recipe | BrandedFoodEdits | LoadingFood | null,
  foodByDocumentPath: {[index: string]: Food | LoadingFood},
  nutrientInfos: NutrientInfo[] | null,
  selectedQuantity: number,
}
