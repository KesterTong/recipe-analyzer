import * as $ from 'jquery';
import { IngredientIdentifier } from '../core/FoodRef';
import { NormalizedFood } from '../core/NormalizedFood';
import { nameForNutrient } from '../core/Nutrients';
import { searchFoods, addIngredient, getNutrientsToDisplay, showCustomIngredientSidebar, getFood, patchFood } from './script_functions';
import { Food } from '../core/Food';
import { normalizeFood } from '../core/normalizeFood';
import { addDetailsTab } from './custom_ingredient';

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
  getNutrientsToDisplay(null).then(nutrientsToDisplay => {
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
        foodNutrients: nutrientsToDisplay.map(id => ({
          nutrient: {id: id},
          amount: 0,
        })),
      },
    })
  }).then(() => {
    showCustomIngredientSidebar(bookmarkId);
  });
});

function handleFood(food: Food | null, nutrientsToDisplay: number[] | null) {
  let normalizedFood = normalizeFood(food!, nutrientsToDisplay!)!;
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
  let nutrientsToDisplayPromise = getNutrientsToDisplay(null)
  nutrientsToDisplayPromise.then(nutrientsToDisplay => {
    nutrientsToDisplay.forEach(id => {
      let label = $('<b></b>').text(nameForNutrient(id)! + ': ');
      let amount = $('<span></span>', {id: 'nutrient-' + id});
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
        nutrientsToDisplayPromise]).then(args =>
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