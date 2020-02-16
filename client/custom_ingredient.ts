import * as $ from 'jquery';
import { BrandedFood } from '../core/FoodDataCentral';
import { patchFood, getFood } from './script_functions';
import { Food } from '../core/Food';
import { nameForNutrient } from '../core/Nutrients';

const google = (<any>window)['google'];

function handleFoodDetails(details: BrandedFood) {
  $('#description').val(details.description);
  $('#serving-size').val(details.servingSize);
  $('#serving-size-unit').val(details.servingSizeUnit);
  $('#household-serving-full-text').val(details?.householdServingFullText || '');
  details.foodNutrients.forEach(function(foodNutrient) {
    let name = 'nutrient-' + foodNutrient.nutrient.id.toString();
    let description = nameForNutrient(foodNutrient.nutrient.id);
    let label = $('<label></label>', {for: name}).text(description!);
    let amount = $('<input></input>', {
      id: name,
      name: name,
      type: 'text',
      class: 'nutrient-value',
    });
    amount.data('id', foodNutrient.nutrient.id);
    amount.val(details.servingSize * (foodNutrient?.amount || 0) / 100.0);
    $('#button-bar').before($('<div></div>', {class: 'block'}).append([label, amount]));
  })
}
$('#save').click(function(event) {
  let servingSize = Number($('#serving-size').val());
  let foodNutrients = $('.nutrient-value').map(function() {
    return {
      nutrient: {id: $(this).data('id')},
      amount: 100.0 * Number($(this).val()) / servingSize,
    };
  }).toArray();
  let food: Food = {
    dataType: 'Branded',
    description: <string>$('#description').val(),
    servingSize: servingSize,
    servingSizeUnit: <string>$('#serving-size-unit').val(),
    householdServingFullText: <string>$('#household-serving-full-text').val(),
    foodNutrients: foodNutrients,
  };
  patchFood({
    ingredientIdentifier: {
        identifierType: 'BookmarkId',
        bookmarkId: (<any>window)['bookmarkId'],
    },
    food: food,
  });
});
getFood({
  identifierType: 'BookmarkId',
  bookmarkId: (<any>window)['bookmarkId'],
}).then(handleFoodDetails);