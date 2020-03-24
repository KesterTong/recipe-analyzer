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

import { RootState } from "./types";
import { FoodRef } from "../../core/FoodRef";

export function selectFoodRef(state: RootState): FoodRef | null {
  if (state.deselected || state.foodId == null) {
    return null;
  }
  let description: string;
  switch (state.foodState?.stateType) {
    case "BrandedFoodEdit":
    case "RecipeEdit":
      description = state.foodState.description;
      break;
    case "FoodView":
    case "Loading":
      description = state.foodState.food.description || "Loading...";
      break;
    default:
      throw "Illegal state: foodId was not null but foodState was null";
  }
  return {
    foodId: state.foodId,
    description,
  };
}
