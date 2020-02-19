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
  let unit = <string>$('#unit').val();
  // TODO: do this computation server side.
  let servings = Number($('#amount').val()) / food.servingEquivalentQuantities[unit];
  for (let id in food.nutrientsPerServing) {
    let value = servings * food.nutrientsPerServing[id];
    $('#nutrient-' + id).text(value);
  }
}
function handleFood(food: Food | null, nutrientInfos: NutrientInfo[] | null) {
  let normalizedFood = normalizeFood(food!, nutrientInfos!.map(nutrientInfo => nutrientInfo.id))!;
  currentFood = normalizedFood;
  $('#description').val(normalizedFood.description);
  $('#brand').text(normalizedFood.brandOwner || '');
  $('#ingredients').text(normalizedFood.ingredients || '');
  $('#unit').empty()
  for (let unit in normalizedFood.servingEquivalentQuantities) {
    $('#unit').append($('<option></option>').text(unit));
  }
  $('#unit').val('g');
  $('#amount').val(100);
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

  $('#amount').on('keyup', handleQuantityChange);
  $('#unit').on('change', handleQuantityChange);
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
  $('#insert-ingredient').click(event => {
    if (currentFood != null) {
      // Fetch description from text input so that user can override description
      // when inserting ingredient.
      let description = <string>$('#description').val();
      // TODO: parse this server side.
      let amount = Number($('#amount').val());
      let unit = <string>$('#unit').val()
      getIngredientDatabase().addIngredient(currentIngredientIdentifier!, amount, unit, description);
    }
  });
  $('#description').focus();
  $( "#tabs" ).tabs();
};
