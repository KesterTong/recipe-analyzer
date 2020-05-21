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

import { Ingredient } from "./Recipe";
import { NormalizedFood } from "./NormalizedFood";
import { Nutrients, scaleNutrients } from "./Nutrients";
import { StatusOr, StatusCode, status, isOk } from "./StatusOr";
import { parseFdcWebUrl } from "./FoodDataCentral";
import { canonicalizeQuantity, ConversionData } from "./canonicalizeQuantity";

export function nutrientsForIngredient(
  ingredient: Ingredient,
  fdcFoodsById: { [index: string]: StatusOr<NormalizedFood> },
  conversionData: ConversionData
): StatusOr<Nutrients> {
  if (ingredient.ingredient.url == null) {
    // If the ingredient has no URL then it is just text and
    // we return no nutrients.
    return {};
  }
  const fdcId = parseFdcWebUrl(ingredient.ingredient.url);
  let normalizedFood: NormalizedFood;
  if (fdcId === null) {
    return status(
      StatusCode.FOOD_NOT_FOUND,
      "URL " + ingredient.ingredient.url + " not recognized"
    );
  } else {
    let statusOrNormalizedFood = fdcFoodsById[fdcId];
    if (statusOrNormalizedFood === undefined) {
      return status(StatusCode.LOADING, "Loading");
    } else if (!isOk(statusOrNormalizedFood)) {
      return statusOrNormalizedFood;
    } else {
      normalizedFood = statusOrNormalizedFood;
    }
  }
  // oneUnit = 1 x ingredient.unit
  const oneUnit = canonicalizeQuantity(
    { amount: 1, unit: ingredient.unit },
    conversionData
  );
  let matchingQuantities = normalizedFood.servingEquivalents.filter(
    (quantity) => quantity.unit == oneUnit.unit
  );
  if (matchingQuantities.length === 0) {
    return status(
      StatusCode.UNKNOWN_UNIT,
      "Could not convert unit " + ingredient.unit + " for food"
    );
  }
  // matchingQuantities[0] = 1 serving
  let amount = Number(ingredient.amount);
  if (isNaN(amount)) {
    return status(StatusCode.NAN_AMOUNT, "Could not convert amount to number");
  }
  // Combining the above two equations, and the fact that matchingQuanties[0]
  // has the same units as oneUnit:
  //
  // 1 serving / amatchingQuantities[0].amount = ingredient.unit / oneUnit.amount
  //
  // Multipling both sides by oneUnit.amount * ingredient.amount, we have
  //
  // ingredient.unit * ingredient.amount =
  //   = 1 serving * oneUnit.amount * ingredient.amount / amatchingQuantities[0].amount
  return scaleNutrients(
    normalizedFood.nutrientsPerServing,
    (amount * oneUnit.amount) / matchingQuantities[0].amount
  );
}
