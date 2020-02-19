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

import { IngredientDatabase } from '../../core/IngredientDatabase';

import { TEST_SR_LEGACY_FOOD, TEST_RECIPE_DETAILS } from '../testData';

import { expect } from 'chai';
import 'mocha';
import { mock, instance, when, verify, deepEqual, capture } from 'ts-mockito';
import { FirebaseImpl, Document } from '../../appsscript/FirebaseImpl';
import { FoodDataCentralImpl } from '../../appsscript/FoodDataCentralImpl';
import { IngredientDatabaseImpl } from '../../appsscript/IngredientDatabaseImpl';

describe('IngredientDatabaseImpl', () => {
  let mockedScriptProperties = mock<GoogleAppsScript.Properties.Properties>();
  when(mockedScriptProperties.getProperty('USDA_API_KEY')).thenReturn('abcde');
  when(mockedScriptProperties.getProperty('FIREBASE_PROJECT_NAME')).thenReturn('project_name');
  let scriptProperties = instance(mockedScriptProperties);

  let mockedPropertiesService = mock<GoogleAppsScript.Properties.PropertiesService>();
  when(mockedPropertiesService.getScriptProperties()).thenReturn(scriptProperties);
  let propertiesService = instance(mockedPropertiesService);

  let mockedHTTPResponse = mock<GoogleAppsScript.URL_Fetch.HTTPResponse>();
  when(mockedHTTPResponse.getContentText()).thenReturn(JSON.stringify(TEST_SR_LEGACY_FOOD));
  
  let mockedFoundHTTPResponse = mock<GoogleAppsScript.URL_Fetch.HTTPResponse>();
  when(mockedFoundHTTPResponse.getResponseCode()).thenReturn(200);
  when(mockedFoundHTTPResponse.getContentText()).thenReturn(JSON.stringify({
    fields: {
      data: {stringValue: JSON.stringify(TEST_SR_LEGACY_FOOD)},
      version: {stringValue: '0.1'},
    }
  }));

  let mockedFoundRecipeHTTPResponse = mock<GoogleAppsScript.URL_Fetch.HTTPResponse>();
  when(mockedFoundRecipeHTTPResponse.getResponseCode()).thenReturn(200);
  when(mockedFoundRecipeHTTPResponse.getContentText()).thenReturn(JSON.stringify({
    fields: {
      data: {stringValue: JSON.stringify(TEST_RECIPE_DETAILS)},
      version: {stringValue: '0.1'},
    }
  }));

  let mockedNotFoundHTTPResponse = mock<GoogleAppsScript.URL_Fetch.HTTPResponse>();
  when(mockedNotFoundHTTPResponse.getResponseCode()).thenReturn(404);

  let mockedUrlFetchApp = mock<GoogleAppsScript.URL_Fetch.UrlFetchApp>();
  when(mockedUrlFetchApp.fetch('https://api.nal.usda.gov/fdc/v1/12345?api_key=abcde')).thenReturn(
    instance(mockedHTTPResponse));
  when(mockedUrlFetchApp.fetch(
    'https://firestore.googleapis.com/v1/projects/project_name/databases/(default)/documents/fdcData/11111',
    deepEqual({
      method: "get",
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer oauth_token",
      },
      muteHttpExceptions: true,
    }))).thenReturn(instance(mockedFoundHTTPResponse));
  when(mockedUrlFetchApp.fetch(
    'https://firestore.googleapis.com/v1/projects/project_name/databases/(default)/documents/fdcData/12345',
    deepEqual({
      method: "get",
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer oauth_token",
      },
      muteHttpExceptions: true,
    }))).thenReturn(instance(mockedNotFoundHTTPResponse));
  when(mockedUrlFetchApp.fetch(
    'https://firestore.googleapis.com/v1/projects/project_name/databases/(default)/documents/userData/id.def456',
    deepEqual({
      method: "get",
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer oauth_token",
      },
      muteHttpExceptions: true,
    }))).thenReturn(instance(mockedNotFoundHTTPResponse));
  when(mockedUrlFetchApp.fetch(
    'https://firestore.googleapis.com/v1/projects/project_name/databases/(default)/documents/userData/id.abc123',
    deepEqual({
      method: "get",
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer oauth_token",
      },
      muteHttpExceptions: true,
    }))).thenReturn(instance(mockedFoundRecipeHTTPResponse));
  let urlFetchApp = instance(mockedUrlFetchApp);

  let mockedScriptApp = mock<GoogleAppsScript.Script.ScriptApp>();
  when(mockedScriptApp.getOAuthToken()).thenReturn('oauth_token');
  let scriptApp = instance(mockedScriptApp);
  
  let fdcClient = new IngredientDatabaseImpl(
    new FoodDataCentralImpl(urlFetchApp, propertiesService), 
    new FirebaseImpl(urlFetchApp, scriptApp, propertiesService));

  it('ingredient in firebase', () => {
    expect(fdcClient.getFood({identifierType: 'FdcId', fdcId: 11111})).to.deep.equal(TEST_SR_LEGACY_FOOD);
  });

  it('ingredient not in firebase', () => {
    expect(fdcClient.getFood({identifierType: 'FdcId', fdcId: 12345})).to.deep.equal(TEST_SR_LEGACY_FOOD);
    verify(mockedUrlFetchApp.fetch(
      'https://firestore.googleapis.com/v1/projects/project_name/databases/(default)/documents/fdcData/12345',
      deepEqual({
        method: "patch",
        headers: {
          "Content-type": "application/json",
          "Authorization": "Bearer oauth_token",
        },
        payload: JSON.stringify({
          fields: {
            version: {stringValue: '0.1'},
            data: {stringValue: JSON.stringify(TEST_SR_LEGACY_FOOD)},
          }
        }),
      }))).once();
  });

  it('local not found', () => {
    expect(fdcClient.getFood({identifierType: 'BookmarkId', bookmarkId: 'id.def456'})).to.equal(null);
  });

  it('local food', () => {
    expect(fdcClient.getFood({identifierType: 'BookmarkId', bookmarkId: 'id.abc123'})).to.deep.equal(TEST_RECIPE_DETAILS);
  });

  it('addCustomFood', () => {
    fdcClient.patchFood({identifierType: 'BookmarkId', bookmarkId: 'id.abc123'}, TEST_RECIPE_DETAILS);
    verify(mockedUrlFetchApp.fetch(
      'https://firestore.googleapis.com/v1/projects/project_name/databases/(default)/documents/userData/id.abc123',
      deepEqual({
        method: "patch",
        headers: {
          "Content-type": "application/json",
          "Authorization": "Bearer oauth_token",
        },
        payload: JSON.stringify({
          fields: {
            version: {stringValue: '0.1'},
            data: {stringValue: JSON.stringify(TEST_RECIPE_DETAILS)},
          }
        }),
      }))).once();
  });
});
