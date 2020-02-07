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
import { TEST_RECIPE_DETAILS, TEST_BRANDED_FOOD } from './testData';
import { mock, instance, when, verify, anyString, anyNumber } from 'ts-mockito';
import { IngredientDatabase } from '../IngredientDatabase';
import { BookmarkManager } from '../BookmarkManager';

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
  // TODO: check if null is correct here.
  let linkUrl: string = <any>null;
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
  let mockedScriptProperties = mock<GoogleAppsScript.Properties.Properties>();
  when(mockedScriptProperties.getProperty('DISPLAY_NUTRIENTS')).thenReturn('[1008, 1003]');
  let scriptProperties = instance(mockedScriptProperties);

  let mockedPropertiesService = mock<GoogleAppsScript.Properties.PropertiesService>();
  when(mockedPropertiesService.getScriptProperties()).thenReturn(scriptProperties);
  let propertiesService = instance(mockedPropertiesService);
  let documentApp = instance(mock<GoogleAppsScript.Document.DocumentApp>());

  it('no link', () => {
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mock<BookmarkManager>()),
      instance(mock<IngredientDatabase>()),
      propertiesService,
      documentApp);
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('10 g abcdefg');
    let listItem = createListItem(text);
    var nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({});
    expect(text.getText()).to.equal('10 g abcdefg\t-\t-');
    verify(mockedText.setLinkUrl(12, 15, <any>null)).once();
  });

  // Regression test for old parsing logic that would error out when
  // there was no quanity unit.
  it('no link no units', () => {
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mock<BookmarkManager>()),
      instance(mock<IngredientDatabase>()),
      propertiesService,
      documentApp);
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('10 bananas');
    let listItem = createListItem(text);
    var nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({});
    expect(text.getText()).to.equal('10 bananas\t-\t-');
    verify(mockedText.setLinkUrl(10, 13, <any>null)).once();
  });

  it('no link with tabs', () => {
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mock<BookmarkManager>()),
      instance(mock<IngredientDatabase>()),
      propertiesService,
      documentApp);
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('10 g abcdefg\t-\t-');
    let listItem = createListItem(text);
    let nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({});
    expect(text.getText()).to.equal('10 g abcdefg\t-\t-');
    verify(mockedText.setLinkUrl(12, 15, <any>null)).once();
  });

  it('recipe not found', () => {
    let mockFdcClient = mock<IngredientDatabase>();
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mock<BookmarkManager>()),
      instance(mockFdcClient),
      propertiesService,
      documentApp);
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('10 g abcdefg');
    text.setLinkUrl(5, 11, '#bookmark=id.NOT_AN_ID');
    let listItem = createListItem(text);
    var nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({});
    expect(text.getText()).to.equal('10 g abcdefg\t-\t-');
    verify(mockedText.setLinkUrl(12, 15, <any>null)).once();
    verify(mockFdcClient.getFoodDetails('#bookmark=id.NOT_AN_ID')).once();
  });

  it('recipe not found with tabs', () => {
    let mockFdcClient = mock<IngredientDatabase>();
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mock<BookmarkManager>()),
      instance(mockFdcClient),
      propertiesService,
      documentApp);
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('10 g abcdefg\t-\t-');
    text.setLinkUrl(5, 11, '#bookmark=id.NOT_AN_ID');
    let listItem = createListItem(text);
    let nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({});
    expect(text.getText()).to.equal('10 g abcdefg\t-\t-');
    verify(mockedText.setLinkUrl(12, 15, <any>null)).once();
    verify(mockFdcClient.getFoodDetails('#bookmark=id.NOT_AN_ID')).once();
  });

  it('FDC data', () => {
    let mockFdcClient = mock<IngredientDatabase>();
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mock<BookmarkManager>()),
      instance(mockFdcClient),
      propertiesService,
      documentApp);
    when(mockFdcClient.getFoodDetails('https://fdc.nal.usda.gov/fdc-app.html#/food-details/12345/nutrients')).thenReturn(TEST_BRANDED_FOOD);
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('60 pieces Banana Chips');
    text.setLinkUrl(10, 21, 'https://fdc.nal.usda.gov/fdc-app.html#/food-details/12345/nutrients');
    let listItem = createListItem(text);
    let nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({1008: 1700.0, 1003: 20.0});
    expect(text.getText()).to.equal('60 pieces Banana Chips\t1700\t20');
    verify(mockedText.setLinkUrl(22, 29, <any>null)).once();
  });

  it('recipe', () => {
    let mockFdcClient = mock<IngredientDatabase>();
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mock<BookmarkManager>()),
      instance(mockFdcClient),
      propertiesService,
      documentApp);
    when(mockFdcClient.getFoodDetails('#bookmark=id.ghi789')).thenReturn(TEST_RECIPE_DETAILS);
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('0.5 serving My Recipe');
    text.setLinkUrl(12, 20, '#bookmark=id.ghi789');
    let listItem = createListItem(text);
    let nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({1008: 50.0, 1003: 10.0});
    expect(text.getText()).to.equal('0.5 serving My Recipe\t50\t10');
    verify(mockedText.setLinkUrl(21, 26, <any>null)).once();
  });

  it('recipe with plural', () => {
    let mockFdcClient = mock<IngredientDatabase>();
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mock<BookmarkManager>()),
      instance(mockFdcClient),
      propertiesService,
      documentApp);
    when(mockFdcClient.getFoodDetails('#bookmark=id.ghi789')).thenReturn(TEST_RECIPE_DETAILS);
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('1.5 servings My Recipe');
    text.setLinkUrl(13, 21, '#bookmark=id.ghi789');
    let listItem = createListItem(text);
    let nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({1008: 150.0, 1003: 30.0});
    expect(text.getText()).to.equal('1.5 servings My Recipe\t150\t30');
    verify(mockedText.setLinkUrl(22, 28, <any>null)).once();
  });

  it('recipe with existing output', () => {
    let mockFdcClient = mock<IngredientDatabase>();
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mock<BookmarkManager>()),
      instance(mockFdcClient),
      propertiesService,
      documentApp);
    when(mockFdcClient.getFoodDetails('#bookmark=id.ghi789')).thenReturn(TEST_RECIPE_DETAILS);
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('1.5 servings My Recipe\t-\t-');
    text.setLinkUrl(13, 21, '#bookmark=id.ghi789');
    let listItem = createListItem(text);
    var nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({1008: 150.0, 1003: 30.0});
    expect(text.getText()).to.equal('1.5 servings My Recipe\t150\t30');
    verify(mockedText.setLinkUrl(22, 28, <any>null)).once();
  });

  it('recipe with trailing space', () => {
    let mockFdcClient = mock<IngredientDatabase>();
    let recipeAnalyzer = new RecipeAnalyzer(
      instance(mock<BookmarkManager>()),
      instance(mockFdcClient),
      propertiesService,
      documentApp);
    when(mockFdcClient.getFoodDetails('#bookmark=id.ghi789')).thenReturn(TEST_RECIPE_DETAILS);
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    setupMockText(mockedText);
    let text = instance(mockedText); 
    text.appendText('1 serving My Recipe \t-\t-');
    text.setLinkUrl(10, 18, '#bookmark=id.ghi789');
    let listItem = createListItem(text);
    var nutrients = recipeAnalyzer.updateElement(listItem);
    expect(nutrients).to.deep.equal({1008: 100.0, 1003: 20.0});
    expect(text.getText()).to.equal('1 serving My Recipe \t100\t20');
    verify(mockedText.setLinkUrl(20, 26, <any>null)).once();
  });
});
