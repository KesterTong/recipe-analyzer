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

import { RecipeAnalyzer } from '../RecipeAnalyzer';

import { expect } from 'chai';
import 'mocha';
import { TEST_BRANDED_FOOD_DATA, TEST_RECIPE_DATA, TEST_BRANDED_FOOD } from './testData';
import { mock, instance, when, verify, anyString, anyNumber } from 'ts-mockito';
import { FDCClient } from '../FDCClient';
import { LocalIngredients } from '../LocalIngredients';

function createListItem(text: GoogleAppsScript.Document.Text): GoogleAppsScript.Document.ListItem {
  let mockedListItem = mock<GoogleAppsScript.Document.ListItem>();
  let listItem = instance(mockedListItem);
  when(mockedListItem.getNumChildren()).thenReturn(1);
  when(mockedListItem.getChild(0)).thenReturn(text);
  return listItem;
}

function setupMockText(mockedText: GoogleAppsScript.Document.Text) {
  let asText = '';
  let linkStartOffset: number = 0;
  let linkEndOffsetInclusive: number = 0;
  let linkUrl: string = null;
  when(mockedText.getText()).thenCall(() => {
    return asText;
  });
  when(mockedText.replaceText(anyString(), anyString())).thenCall((searchPattern, replacement) => {
    asText = asText.replace(new RegExp(searchPattern), replacement);
  });
  when(mockedText.appendText(anyString())).thenCall((text) => {
    asText += text;
  });
  when(mockedText.setLinkUrl(anyNumber(), anyNumber(), anyString())).thenCall((startOffset, endOffsetInclusive, url) => {
    linkStartOffset = startOffset;
    linkEndOffsetInclusive = endOffsetInclusive;
    linkUrl = url;
  });
  when(mockedText.getLinkUrl(anyNumber())).thenCall((offset) => {
    if (offset >= linkStartOffset && offset <= linkEndOffsetInclusive) {
      return linkUrl;
    }
    return null;
  })
  return instance(mockedText)
}

describe('updateElementAndRunningTotal', () => {
  it('no link', () => {
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mock<LocalIngredients>()),
      instance(mock<FDCClient>()));
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('10 g abcdefg');
    let listItem = createListItem(text);
    var nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({});
    expect(text.getText()).to.equal('10 g abcdefg\t-\t-');
    verify(mockedText.setLinkUrl(12, 15, null)).once();
  });

  it('no link with tabs', () => {
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mock<LocalIngredients>()),
      instance(mock<FDCClient>()));
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('10 g abcdefg\t-\t-');
    let listItem = createListItem(text);
    let nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({});
    expect(text.getText()).to.equal('10 g abcdefg\t-\t-');
    verify(mockedText.setLinkUrl(12, 15, null)).once();
  });

  it('recipe not found', () => {
    let mockLocalIngredients = mock<LocalIngredients>();
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mockLocalIngredients),
      instance(mock<FDCClient>()));
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('10 g abcdefg');
    text.setLinkUrl(5, 11, '#bookmark=id.NOT_AN_ID');
    let listItem = createListItem(text);
    var nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({});
    expect(text.getText()).to.equal('10 g abcdefg\t-\t-');
    verify(mockedText.setLinkUrl(12, 15, null)).once();
    verify(mockLocalIngredients.getFoodData('id.NOT_AN_ID')).once();
  });

  it('recipe not found with tabs', () => {
    let mockLocalIngredients = mock<LocalIngredients>();
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mockLocalIngredients),
      instance(mock<FDCClient>()));
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('10 g abcdefg\t-\t-');
    text.setLinkUrl(5, 11, '#bookmark=id.NOT_AN_ID');
    let listItem = createListItem(text);
    let nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({});
    expect(text.getText()).to.equal('10 g abcdefg\t-\t-');
    verify(mockedText.setLinkUrl(12, 15, null)).once();
    verify(mockLocalIngredients.getFoodData('id.NOT_AN_ID')).once();
  });

  it('FDC_data', () => {
    let mockFdcClient = mock<FDCClient>();
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mock<LocalIngredients>()),
      instance(mockFdcClient));
    when(mockFdcClient.getFoodDetails('12345')).thenReturn(TEST_BRANDED_FOOD);
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('60 pieces Banana Chips');
    text.setLinkUrl(10, 21, 'https://fdc.nal.usda.gov/fdc-app.html#/food-details/12345/nutrients');
    let listItem = createListItem(text);
    let nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({calories: 1700.0, protein: 20.0});
    expect(text.getText()).to.equal('60 pieces Banana Chips\t1700\t20');
    verify(mockedText.setLinkUrl(22, 29, null)).once();
  });

  it('recipe', () => {
    let mockLocalIngredients = mock<LocalIngredients>()
    when(mockLocalIngredients.getFoodData('id.ghi789')).thenReturn(TEST_RECIPE_DATA);
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mockLocalIngredients),
      instance(mock<FDCClient>()));
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('0.5 serving My Recipe');
    text.setLinkUrl(12, 20, '#bookmark=id.ghi789');
    let listItem = createListItem(text);
    let nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({calories: 50.0, protein: 10.0});
    expect(text.getText()).to.equal('0.5 serving My Recipe\t50\t10');
    verify(mockedText.setLinkUrl(21, 26, null)).once();
  });

  it('recipe with plural', () => {
    let mockLocalIngredients = mock<LocalIngredients>()
    when(mockLocalIngredients.getFoodData('id.ghi789')).thenReturn(TEST_RECIPE_DATA);
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mockLocalIngredients),
      instance(mock<FDCClient>()));
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('1.5 servings My Recipe');
    text.setLinkUrl(13, 21, '#bookmark=id.ghi789');
    let listItem = createListItem(text);
    let nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({calories: 150.0, protein: 30.0});
    expect(text.getText()).to.equal('1.5 servings My Recipe\t150\t30');
    verify(mockedText.setLinkUrl(22, 28, null)).once();
  });

  it('recipe with existing output', () => {
    let mockLocalIngredients = mock<LocalIngredients>()
    when(mockLocalIngredients.getFoodData('id.ghi789')).thenReturn(TEST_RECIPE_DATA);
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mockLocalIngredients),
      instance(mock<FDCClient>()));
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('1.5 servings My Recipe\t-\t-');
    text.setLinkUrl(13, 21, '#bookmark=id.ghi789');
    let listItem = createListItem(text);
    var nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({calories: 150.0, protein: 30.0});
    expect(text.getText()).to.equal('1.5 servings My Recipe\t150\t30');
    verify(mockedText.setLinkUrl(22, 28, null)).once();
  });
});
