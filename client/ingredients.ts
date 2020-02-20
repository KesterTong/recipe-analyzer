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

import * as $ from 'jquery';
import { IngredientIdentifier } from '../core/FoodRef';
import { NormalizedFood } from '../core/NormalizedFood';
import { getIngredientDatabase } from './IngredientDatabase';
import { Food } from '../core/Food';
import { normalizeFood } from '../core/normalizeFood';
import { addDetailsTab } from './custom_ingredient';
import { NutrientInfo } from '../core/Nutrients';

let currentIngredientIdentifier: IngredientIdentifier | null = null;
let currentFood: NormalizedFood | null = null;

function handleQuantityChange() {
  let food = currentFood!;
  // TODO: do this computation server side.
  let servings = Number($('#quantity').val());
  for (let id in food.nutrientsPerServing) {
    let value = servings * food.nutrientsPerServing[id];
    $('#nutrient-' + id).text(value);
  }
}
function handleFood(food: Food | null, nutrientInfos: NutrientInfo[] | null) {
  if (food == null || nutrientInfos == null) {
    return;
  }
  currentFood = normalizeFood(food, nutrientInfos.map(nutrientInfo => nutrientInfo.id));
  let brand: string | undefined;
  let ingredients: string | undefined;
  $('#description').val(food.description);
  $('#quantity').empty()
  switch (food!.dataType) {
    case 'Recipe':
      $('#quantity').append($('<option></option>', {value: 1}).text('1 serving'));
      break;
    case 'Branded':
      brand = food.brandOwner;
      ingredients = food.ingredients;
      $('#quantity').append($('<option></option>', {value: 1}).text('100 ' + food.servingSizeUnit));
      $('#quantity').append($('<option></option>', {value: food.servingSize / 100}).text(food.householdServingFullText || ''));
      break;
    case 'SR Legacy':
      $('#quantity').append($('<option></option>', {value: 1}).text('100 g'));
      food.foodPortions.forEach(portion => {
        let portionText = portion.amount.toString() + ' ' + portion.modifier + ' (' + portion.gramWeight + ' g)';
        let servings = portion.gramWeight / 100;
        $('#quantity').append($('<option></option>', {value: servings}).text(portionText));
      });
      break;
  }
  if (brand) {
    $('#brand').text(brand).parent().show();
  } else {
    $('#brand').parent().hide();
  }
  if (ingredients) {
    $('#ingredients').text(ingredients).parent().show();
  } else {
    $('#ingredients').parent().hide();
  }
  handleQuantityChange();
}
export function main() {
  let nutrientInfoPromise = getIngredientDatabase().getNutrientInfo();
  nutrientInfoPromise.then(nutrientInfos => {
    nutrientInfos.forEach(nutrientInfo => {
      let label = $('<b></b>').text(nutrientInfo.name + ': ');
      let amount = $('<span></span>', {id: 'nutrient-' + nutrientInfo.id});
      $('#button-bar').before($('<div></div>', {class: 'block'}).append([label, amount]));
    })
  });
  $('#description').autocomplete({
    source: function(request: any, response: any) {
      getIngredientDatabase().searchFoods(request.term).then(results => {
        response(results.map(function(entry) {
          return {
            label: entry.description,
            value: JSON.stringify(entry.identifier),
          };
        }));
      });
    },
    select: function(event, ui) {
      event.preventDefault();
      currentIngredientIdentifier = JSON.parse(ui.item.value);
      Promise.all([
        getIngredientDatabase().getFood(currentIngredientIdentifier!),
        nutrientInfoPromise]).then(args =>
          handleFood(args[0], args[1]));
    },
  });
  $('#quantity').on('change', handleQuantityChange);
  $('#more-details').on('click', function(event) {
    let ingredientIdentifier = currentIngredientIdentifier!;
    switch(ingredientIdentifier.identifierType) {
      case 'BookmarkId':
        addDetailsTab(ingredientIdentifier.bookmarkId);
        break;
      case 'FdcId':
        window.open(
          'https://fdc.nal.usda.gov/fdc-app.html#/food-details/' +
          ingredientIdentifier.fdcId.toString() + '/nutrients',
          '_blank');
        break;
    }
  });
  $('#new-ingredient').on('click', function(event) {
    let bookmarkId = Date.now().toString();
    getIngredientDatabase().getNutrientInfo().then(nutrientInfos => {
      return getIngredientDatabase().patchFood(
        {
          identifierType: 'BookmarkId',
          bookmarkId: bookmarkId,
        },
        {
          dataType: 'Branded',
          servingSize: 100,
          servingSizeUnit: 'g',
          householdServingFullText: '1 serving',
          description: 'New custom food',
          foodNutrients: nutrientInfos.map(nutrientInfo => ({
            nutrient: {id: nutrientInfo.id},
            amount: 0,
          })),
        });
    }).then(() => {
      addDetailsTab(bookmarkId);
    });
  });
  $('#description').focus();
  $( "#tabs" ).tabs();
};
