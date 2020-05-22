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

import { Quantity } from "../core/Quantity";
import { canonicalizeQuantity, ConversionData } from "../core/canonicalizeQuantity";
import { BrandedFood } from "./BrandedFood";
import { parseQuantity } from "./parseQuantity";

export function brandedServingEquivalents(food: BrandedFood, conversionData: ConversionData): Quantity[] {
  // A serving is 100 g or 100 ml depending on servingSizeUnit, for Branded foods.
  let result = [{ amount: 100, unit: food.servingSizeUnit }];
  let householdServingQuantity = food.householdServingFullText == null
    ? null
    : parseQuantity(food.householdServingFullText);
  if (householdServingQuantity != null) {
    const { amount, unit } = canonicalizeQuantity({
      amount: householdServingQuantity.amount,
      unit: householdServingQuantity.unit,
    }, conversionData);
    const amountPerServing = (100.0 * amount) / food.servingSize;
    result.push({ amount: amountPerServing, unit });
  }
  return result;
}
