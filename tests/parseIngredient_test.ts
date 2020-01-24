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

import { parseIngredient } from '../parseIngredient';
import { expect } from 'chai';
import { mock, when, instance } from 'ts-mockito';

describe('parseIngredient', () => {
  it('number', () => {
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    when(mockedText.getText()).thenReturn('1 cup banana');
    when(mockedText.getLinkUrl(6)).thenReturn('#bookmark=id.abc123');
    let text = instance(mockedText); 
    expect(parseIngredient(text)).to.deep.equal({
      quantity: {amount: 1.0, unit: 'cup'},
      id: {fdcId: null, bookmarkId: 'id.abc123'},
    });
  });
  it('number with decimel', () => {
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    when(mockedText.getText()).thenReturn('1.5 cup banana');
    when(mockedText.getLinkUrl(8)).thenReturn('#bookmark=id.abc123');
    let text = instance(mockedText); 
    expect(parseIngredient(text)).to.deep.equal({
      quantity: {amount: 1.5, unit: 'cup'},
      id: {fdcId: null, bookmarkId: 'id.abc123'},
    });
  });
  it('number with trailing decimal point', () => {
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    when(mockedText.getLinkUrl(7)).thenReturn('#bookmark=id.abc123');
    when(mockedText.getText()).thenReturn('1. cup banana');
    let text = instance(mockedText); 
    expect(parseIngredient(text)).to.deep.equal({
      quantity: {amount: 1.0, unit: 'cup'},
      id: {fdcId: null, bookmarkId: 'id.abc123'},
    });
  });
  it('pure fraction', () => {
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    when(mockedText.getText()).thenReturn('½ cup banana');
    when(mockedText.getLinkUrl(6)).thenReturn('#bookmark=id.abc123');
    let text = instance(mockedText); 
    expect(parseIngredient(text)).to.deep.equal({
      quantity: {amount: 0.5, unit: 'cup'},
      id: {fdcId: null, bookmarkId: 'id.abc123'},
    });
  });
  it('compound fraction', () => {
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    when(mockedText.getText()).thenReturn('1½ cup banana');
    when(mockedText.getLinkUrl(7)).thenReturn('#bookmark=id.abc123');
    let text = instance(mockedText); 
    expect(parseIngredient(text)).to.deep.equal({
      quantity: {amount: 1.5, unit: 'cup'},
      id: {fdcId: null, bookmarkId: 'id.abc123'},
    });
  });
  it('fdc ingredient', () => {
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    when(mockedText.getText()).thenReturn('100 g banana');
    when(mockedText.getLinkUrl(6)).thenReturn('https://fdc.nal.usda.gov/fdc-app.html#/food-details/173945/nutrients');
    let text = instance(mockedText); 
    expect(parseIngredient(text)).to.deep.equal({
      quantity: {amount: 100, unit: 'g'},
      id: {fdcId: '173945', bookmarkId: null},
    });
  });
  it('fdc ingredient with trailing space', () => {
    let mockedText = mock<GoogleAppsScript.Document.Text>();
    when(mockedText.getText()).thenReturn('100 g banana  ');
    when(mockedText.getLinkUrl(6)).thenReturn('https://fdc.nal.usda.gov/fdc-app.html#/food-details/173945/nutrients');
    let text = instance(mockedText); 
    expect(parseIngredient(text)).to.deep.equal({
      quantity: {amount: 100, unit: 'g'},
      id: {fdcId: '173945', bookmarkId: null},
    });
  });
});