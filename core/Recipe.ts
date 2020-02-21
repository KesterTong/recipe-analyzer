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

import { NormalizedFood } from "./NormalizedFood";
import { Quantity } from "./Quantity";
import { IngredientIdentifier } from "./FoodRef";
import { Nutrients } from "./Nutrients";

export interface Ingredient {
  quantity: Quantity,
  ingredientIdentifier: IngredientIdentifier,
}

// Note that Ingredient (and Recipe) store their nutritional values,
// even though these could becomputed from the ingredients.
//
// This is a form of database normalization since Recipe might be stored
// in a database and so storing the nutritional values avoids extra lookups.
export interface Recipe {
  dataType: 'Recipe';
  description: string;
  // Note this is distinct from the ingredients field which is a text field
  // used for FDC foods.
  ingredientsList: Ingredient[];
}
