import * as $ from 'jquery';
import { IngredientIdentifier } from '../core/FoodRef';
import { NormalizedFood } from '../core/NormalizedFood';
import { getNutrientInfo, getFood, patchFood, searchFoods, addIngredient } from './script_functions';
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
  getNutrientInfo(null).then(nutrientInfos => {
    return patchFood({
      ingredientIdentifier: {
        identifierType: 'BookmarkId',
        bookmarkId: bookmarkId,
      },
      food: {
        dataType: 'Branded',
        servingSize: 100,
        servingSizeUnit: 'g',
        householdServingFullText: '1 serving',
        description: 'New custom food',
        foodNutrients: nutrientInfos.map(nutrientInfo => ({
          nutrient: {id: nutrientInfo.id},
          amount: 0,
        })),
      },
    })
  }).then(() => {
    addDetailsTab(bookmarkId);
  });
});

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
window.onload = function() {
  let nutrientInfoPromise = getNutrientInfo(null);
  nutrientInfoPromise.then(nutrientInfos => {
    nutrientInfos.forEach(nutrientInfo => {
      let label = $('<b></b>').text(nutrientInfo.name + ': ');
      let amount = $('<span></span>', {id: 'nutrient-' + nutrientInfo.id});
      $('#button-bar').before($('<div></div>', {class: 'block'}).append([label, amount]));
    })
  });
  $('#description').autocomplete({
    source: function(request: any, response: any) {
      searchFoods(request.term).then(results => {
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
        getFood(currentIngredientIdentifier!),
        nutrientInfoPromise]).then(args =>
          handleFood(args[0], args[1]));
    },
  });
  $('#description').focus();
};
document.getElementById('insert-ingredient')!.addEventListener('click', function(event) {
  if (currentFood != null) {
    // Fetch description from text input so that user can override description
    // when inserting ingredient.
    let description = <string>$('#description').val();
    // TODO: parse this server side.
    let amount = Number($('#amount').val());
    let unit = <string>$('#unit').val()
    addIngredient({
      ingredientIdentifier: currentIngredientIdentifier!,
      amount: amount,
      unit: unit,
      description: description
    });
  }
})
$( function() {
  $( "#tabs" ).tabs();
} );