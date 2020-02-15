import * as $ from 'jquery';
import { BrandedFood } from '../core/FoodDataCentral';

const google = (<any>window)['google'];

function handleFoodDetails(details: BrandedFood) {
  $('#description').val(details.description);
  $('#serving-size').val(details.servingSize);
  $('#serving-size-unit').val(details.servingSizeUnit);
  $('#household-serving-full-text').val(details?.householdServingFullText || '');
  details.foodNutrients.forEach(function(foodNutrient) {
    let name = 'nutrient-' + foodNutrient.nutrient.id.toString();
    let label = $('<label></label>', {for: name}).text(name);
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
  let food = {
    dataType: 'Branded',
    description: $('#description').val(),
    servingSize: servingSize,
    servingSizeUnit: $('#serving-size-unit').val(),
    householdServingFullText: $('#household-serving-full-text').val(),
    foodNutrients: foodNutrients,
  };
  google.script.run
      .patchFood({
        identifierType: 'BookmarkId',
        bookmarkId: (<any>window)['bookmarkId'],
      }, food);
});
google.script.run
      .withSuccessHandler(handleFoodDetails)
      .getFoodDetails({
        identifierType: 'BookmarkId',
        bookmarkId: (<any>window)['bookmarkId'],
      });