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
import { Food } from '../core/Food';
import { NutrientInfo } from '../core/Nutrients';
import { getIngredientDatabase } from './IngredientDatabase';

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

function handleFoodDetails(details: Food | null, bookmarkId: string, nutrientInfos: NutrientInfo[] | null) {
  console.log('got here')
  if (details == null || details.dataType != 'Branded' || nutrientInfos == null) {
    return;
  }
  let nutrientNameById: {[index: number]: string} = {};
  nutrientInfos.forEach(nutrientInfo => {
    nutrientNameById[nutrientInfo.id] = nutrientInfo.name;
  })

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
    let description = nutrientNameById[id];
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
  getIngredientDatabase().patchFood(
    {
        identifierType: 'BookmarkId',
        bookmarkId: bookmarkId,
    },
    food);
}

export function addDetailsTab(bookmarkId: string) {
  let getFoodPromise = getIngredientDatabase().getFood({
    identifierType: 'BookmarkId',
    bookmarkId: bookmarkId,
  });
  let nutrientInfoPromise = getIngredientDatabase().getNutrientInfo();
  Promise.all([getFoodPromise, nutrientInfoPromise]).then(args =>
    handleFoodDetails(args[0], bookmarkId, args[1])
  );
}