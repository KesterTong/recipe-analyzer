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

import { Ingredient, Recipe } from "./Recipe";
import { NormalizedFood } from "./NormalizedFood";
import { Nutrients, scaleNutrients, addNutrients } from "./Nutrients";
import { StatusOr, StatusCode, status, isOk } from "./StatusOr";
import { parseFdcWebUrl } from "./FoodDataCentral";
import { canonicalizeQuantity, ConversionData } from "./canonicalizeQuantity";

export function normalizeRecipe(
  recipe: Recipe,
  normalizedFoodByUrl: { [index: string]: StatusOr<NormalizedFood> },
  recipes: Recipe[],
  conversionData: ConversionData,
  stack: Recipe[] = []
): StatusOr<NormalizedFood> {
  if (stack.indexOf(recipe) != -1) {
    return status(
      StatusCode.RECIPE_CYCLE_DETECTED,
      "Detected a cycle of recipes that depend on each other: " +
        stack
          .concat([recipe])
          .map((recipe) => recipe.title)
          .join(", ")
    );
  }
  const nutrientsPerServing = recipe.ingredients.reduce<StatusOr<Nutrients>>(
    (cumulativeTotal, ingredient) => {
      if (!isOk(cumulativeTotal)) {
        return cumulativeTotal;
      }
      const nutrients = nutrientsForIngredient(
        ingredient,
        normalizedFoodByUrl,
        recipes,
        conversionData,
        stack.concat([recipe])
      );
      if (isOk(nutrients)) {
        return addNutrients(cumulativeTotal, nutrients);
      } else {
        return nutrients;
      }
    },
    {}
  );
  if (!isOk(nutrientsPerServing)) {
    if (nutrientsPerServing.code == StatusCode.RECIPE_CYCLE_DETECTED) {
      return nutrientsPerServing;
    } else {
      return status(
        StatusCode.INGREDIENT_ERROR,
        "Error in recipe " + recipe.title
      );
    }
  }
  return {
    description: recipe.title,
    nutrientsPerServing,
    servingEquivalents: [{ amount: 1, unit: "serving" }],
  };
}

function lookupIngredient(
  url: string,
  normalizedFoodByUrl: { [index: string]: StatusOr<NormalizedFood> },
  recipes: Recipe[],
  conversionData: ConversionData,
  stack?: Recipe[]
): StatusOr<NormalizedFood> {
  if ((normalizedFoodByUrl[url] !== undefined)) {
    return normalizedFoodByUrl[url];
  } else if (url.startsWith("#")) {
    const matchingRecipes = recipes.filter((recipe) => recipe.url === url);
    if (matchingRecipes.length == 0) {
      return status(StatusCode.FOOD_NOT_FOUND, "Recipe " + url + " not found");
    }
    return normalizeRecipe(
      matchingRecipes[0],
      normalizedFoodByUrl,
      recipes,
      conversionData,
      stack
    );
  } else {
    return status(StatusCode.FOOD_NOT_FOUND, "URL " + url + " not recognized");
  }
}

// Stack is used to prevent infinite recursion
export function nutrientsForIngredient(
  ingredient: Ingredient,
  normalizedFoodByUrl: { [index: string]: StatusOr<NormalizedFood> },
  recipes: Recipe[],
  conversionData: ConversionData,
  stack?: Recipe[]
): StatusOr<Nutrients> {
  if (ingredient.ingredient.url == null) {
    // If the ingredient has no URL then it is just text and
    // we return no nutrients.
    return {};
  }
  const normalizedFood = lookupIngredient(
    ingredient.ingredient.url,
    normalizedFoodByUrl,
    recipes,
    conversionData,
    stack
  );
  if (!isOk(normalizedFood)) {
    return normalizedFood;
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
