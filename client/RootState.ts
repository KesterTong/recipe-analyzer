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

import { NutrientInfo, Nutrients } from "../core/Nutrients";
import { IngredientDatabase } from "../core/IngredientDatabase";
import { IngredientIdentifier } from "../core/FoodRef";
import { Food } from "../core/Food";

export interface LoadingFood {
  dataType: 'Loading',
  description: string,
}

export interface RootState {
  ingredientIdentifier: IngredientIdentifier | null;
  food: Food | LoadingFood | null;
  // By definition, branded foods store their nutrients per
  // 100 g/ml.  However when entering label data, the nutrients
  // are per household serving.  Therefore, we use this as
  // the source of truth while editing a branded food, and update
  // `food` on changes.
  // brandedFoodNutrientsPerServing: Nutrients | null;
  editMode: boolean;
  nutrientInfos: NutrientInfo[] | null;
  selectedQuantity: number;
}
