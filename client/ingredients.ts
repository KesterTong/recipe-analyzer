import * as $ from 'jquery';
import { IngredientIdentifier } from '../core/FoodRef';
import { NormalizedFood } from '../core/NormalizedFood';
import { nameForNutrient } from '../core/Nutrients';
import { getSearchResults, addIngredient, getNutrientsToDisplay, getNormalizedFoodDetails, showCustomIngredientSidebar } from './script_functions';

const google = (<any>window)['google'];

let currentIngredientIdentifier: IngredientIdentifier | null = null;
let currentDetails: NormalizedFood | null = null;

function handleQuantityChange() {
  let food = currentDetails!;
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
      showCustomIngredientSidebar(ingredientIdentifier.bookmarkId);
      break;
    case 'FdcId':
      window.open(
        'https://fdc.nal.usda.gov/fdc-app.html#/food-details/' +
        ingredientIdentifier.fdcId.toString() + '/nutrients',
        '_blank');
      break;
  }
});

function handleFoodDetails(details: NormalizedFood) {
  currentDetails = details;
  $('#description').val(details.description);
  $('#brand').text(details.brandOwner || '');
  $('#ingredients').text(details.ingredients || '');
  $('#unit').empty()
  for (let unit in details.servingEquivalentQuantities) {
    $('#unit').append($('<option></option>').text(unit));
  }
  $('#unit').val('g');
  $('#amount').val(100);
  handleQuantityChange();
}
window.onload = function() {
  $('#description').autocomplete({
    source: function(request: any, response: any) {
      getSearchResults(request.term).then(results => {
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
      getNormalizedFoodDetails(currentIngredientIdentifier!).then(handleFoodDetails);
    },
  });
  $('#description').focus();
  getNutrientsToDisplay(null).then(nutrientsToDisplay => {
    nutrientsToDisplay.forEach(id => {
      let label = $('<b></b>').text(nameForNutrient(id)! + ': ');
      let amount = $('<span></span>', {id: 'nutrient-' + id});
      $('#button-bar').before($('<div></div>', {class: 'block'}).append([label, amount]));
    })
  });
};
document.getElementById('insert-ingredient')!.addEventListener('click', function(event) {
  if (currentDetails != null) {
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