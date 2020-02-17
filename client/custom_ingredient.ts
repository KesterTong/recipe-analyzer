import * as $ from 'jquery';
import { patchFood, getFood } from './script_functions';
import { Food } from '../core/Food';

function elementId(name: string, bookmarkId: string) {
  return name + '-' + bookmarkId.replace('.', '-');
}

function createField(name: string, description: string, initalValue: string | number, bookmarkId: string, input: JQuery<Element>): JQuery<Element> {
  let div = $('<div></div>', {class: 'block form-group'});
  let label = $('<label></label>', {for: name}).text(description);
  input.attr('id', elementId(name, bookmarkId));
  input.attr('name', name);
  input.val(initalValue);
  div.append([label, input]);
  return div;
}

function getFieldValue(name: string, bookmarkId: string): string | number | string[] | undefined {
  return $('#' + elementId(name, bookmarkId)).val()
}

function createTextField(name: string, description: string, initalValue: string | number, bookmarkId: string): JQuery<Element> {
  return createField(
    name, description, initalValue, bookmarkId,
    $('<input>', {type: 'text'}));
}

function createSelectField(name: string, description: string, initalValue: string, bookmarkId: string): JQuery<Element> {
  return createField(
    name, description, initalValue, bookmarkId, 
    $('<select><option>g</option><option>ml</option></select>'));
}

function handleFoodDetails(details: Food | null, bookmarkId: string) {
  if (details == null || details.dataType != 'Branded') {
    return;
  }

  let li = $('<li></li>');
  li.append($('<a></a>', {
    id: elementId('a', bookmarkId),
    href: '#' + elementId('tab', bookmarkId),
  }).text(details.description));
  let tabs = $('#tabs').tabs();
  tabs.find('.ui-tabs-nav').append(li);


  let form = $('<form></form>');

  let fields = [
    createTextField('description', 'Description', details.description, bookmarkId),
    createTextField('serving-size', 'Serving size', details.servingSize, bookmarkId),
    createSelectField('serving-size-unit', 'Serving size unit', details.servingSizeUnit, bookmarkId),
    createTextField('household-serving-full-text', 'Serving size', details.householdServingFullText || '', bookmarkId),
  ]
  // Store nutrient ids so we can fetch them when saving
  let nutrientIds = details.foodNutrients.map(foodNutrient => foodNutrient.nutrient.id);
  details.foodNutrients.forEach(function(foodNutrient) {
    let id = foodNutrient.nutrient.id;
    // TODO: use nutrient description
    let description = 'nutrient ' + id;
    fields.push(createTextField(
      'nutrient-' + id.toString(),
      description,
      details.servingSize * (foodNutrient?.amount || 0) / 100.0,
      bookmarkId));
  })
  form.append(fields);
  
  let saveButton = $('<button>Save</button>', {class: 'action'})
  saveButton.click((event) => { saveFood(bookmarkId, nutrientIds); });
  let closeButton = $('<button>Cancel</button>', {id: 'cancel'});
  closeButton.click((event) => {
    $("#" +  elementId('a', bookmarkId)).remove();
    $("#" +  elementId('tab', bookmarkId)).remove();
    tabs.tabs('refresh');
  });
  let buttonBar = $('<div></div>', {class: 'block', id: elementId('button-bar', bookmarkId)});
  buttonBar.append([saveButton, closeButton]);
  form.append(buttonBar);

  tabs.append($('<div></div>', {id: elementId('tab', bookmarkId)}).append(form));
  tabs.tabs('refresh');
}

function saveFood(bookmarkId: string, nutrientIds: number[]) {
  let servingSize = Number(getFieldValue('serving-size', bookmarkId));
  let foodNutrients = nutrientIds.map(id => ({
    nutrient: {id: id},
    amount: 100.0 * Number(getFieldValue('nutrient-' + id.toString(), bookmarkId)) / servingSize,
  }));
  let food: Food = {
    dataType: 'Branded',
    description: <string>getFieldValue('description', bookmarkId),
    servingSize: servingSize,
    servingSizeUnit: <string>getFieldValue('serving-size-unit', bookmarkId),
    householdServingFullText: <string>getFieldValue('household-serving-full-text', bookmarkId),
    foodNutrients: foodNutrients,
  };
  patchFood({
    ingredientIdentifier: {
        identifierType: 'BookmarkId',
        bookmarkId: bookmarkId,
    },
    food: food,
  });
}

export function addDetailsTab(bookmarkId: string) {
  getFood({
    identifierType: 'BookmarkId',
    bookmarkId: bookmarkId,
  }).then(details => handleFoodDetails(details, bookmarkId));
}