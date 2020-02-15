import * as $ from 'jquery';
import { IngredientIdentifier, FoodRef } from '../core/FoodRef';
import { NormalizedFood } from '../core/NormalizedFood';

const google = (<any>window)['google'];

function handleNutrientNames(nutrientNames: {id: number, name: string}[]) {
  nutrientNames.forEach(function(name) {
    let label = $('<b></b>').text(name.name + ': ');
    let amount = $('<span></span>', {id: 'nutrient-' + name.id});
    $('#button-bar').before($('<div></div>', {class: 'block'}).append([label, amount]));
  })
}
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
      google.script.run.showCustomIngredientSidebar(ingredientIdentifier.bookmarkId);
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
      function handleSearchResults(results: FoodRef[]) {
        response(results.map(function(entry) {
          return {
            label: entry.description,
            value: JSON.stringify(entry.identifier),
          };
        }));
      }
      google.script.run.withSuccessHandler(handleSearchResults).getSearchResults(
        request.term);
    },
    select: function(event, ui) {
      event.preventDefault();
      currentIngredientIdentifier = JSON.parse(ui.item.value);
      google.script.run
      .withSuccessHandler(handleFoodDetails)
      .getNormalizedFoodDetails(currentIngredientIdentifier);
    },
  });
  $('#description').focus();
  google.script.run
  .withSuccessHandler(handleNutrientNames)
  .getNutrientNames();
};
document.getElementById('insert-ingredient')!.addEventListener('click', function(event) {
  if (currentDetails != null) {
    // Fetch description from text input so that user can override description
    // when inserting ingredient.
    let description = $('#description').val();
    // TODO: parse this server side.
    let amount = Number($('#amount').val());
    let unit = $('#unit').val()
    google.script.run.addIngredient(currentIngredientIdentifier, amount, unit, description);
  }
})