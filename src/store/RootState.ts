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
import { NutrientInfo } from "../../core/Nutrients";
import { State as BrandedFoodState } from "./branded_food/types";
import { State as RecipeState } from "./recipe/types";

export interface SelectedFood {
  foodId: string | null,
  description: string | null,
  deselected: boolean,
}

export interface RootState {
  selectedFood: SelectedFood,
  srLegacyFood: SRLegacyFood | null,
  recipeState: RecipeState | null,
  brandedFoodState: BrandedFoodState | null,
  nutrientInfos: NutrientInfo[] | null,
}

export const initialState: RootState = {
  selectedFood: {
    foodId: null,
    description: null,
    deselected: false,
  },
  srLegacyFood: null,
  recipeState: null,
  brandedFoodState: null,
  nutrientInfos: null,
};

