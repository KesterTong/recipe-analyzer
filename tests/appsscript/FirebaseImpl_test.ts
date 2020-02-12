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

import { Document } from '../../core/Firebase';
import { FirebaseImpl } from '../../appsscript/FirebaseImpl';

import { expect } from 'chai';
import 'mocha';
import { mock, instance, when, verify, deepEqual } from 'ts-mockito';

describe('FirebaseImpl', () => {
  let mockedScriptProperties = mock<GoogleAppsScript.Properties.Properties>();
  when(mockedScriptProperties.getProperty('FIREBASE_PROJECT_NAME')).thenReturn('project_name');
  let scriptProperties = instance(mockedScriptProperties);

  let mockedPropertiesService = mock<GoogleAppsScript.Properties.PropertiesService>();
  when(mockedPropertiesService.getScriptProperties()).thenReturn(scriptProperties);
  let propertiesService = instance(mockedPropertiesService);

  let mockedScriptApp = mock<GoogleAppsScript.Script.ScriptApp>();
  when(mockedScriptApp.getOAuthToken()).thenReturn('oauth_token');
  let scriptApp = instance(mockedScriptApp);

  const TEST_DOCUMENT: Document = {
    fields: {
      my_field: {stringValue: 'abc'}
    }
  }

  let mockedHTTPResponse = mock<GoogleAppsScript.URL_Fetch.HTTPResponse>();
  when(mockedHTTPResponse.getResponseCode()).thenReturn(200);
  when(mockedHTTPResponse.getContentText()).thenReturn(JSON.stringify(TEST_DOCUMENT));

  let mockedNotFoundHTTPResponse = mock<GoogleAppsScript.URL_Fetch.HTTPResponse>();
  when(mockedNotFoundHTTPResponse.getResponseCode()).thenReturn(404);

  let mockedUrlFetchApp = mock<GoogleAppsScript.URL_Fetch.UrlFetchApp>();
  when(mockedUrlFetchApp.fetch(
    'https://firestore.googleapis.com/v1/projects/project_name/databases/(default)/documents/fdcData/12345',
    deepEqual({
      method: "get",
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer oauth_token",
      },
      muteHttpExceptions: true,
    }))).thenReturn(instance(mockedHTTPResponse));
    when(mockedUrlFetchApp.fetch(
      'https://firestore.googleapis.com/v1/projects/project_name/databases/(default)/documents/fdcData/11111',
      deepEqual({
        method: "get",
        headers: {
          "Content-type": "application/json",
          "Authorization": "Bearer oauth_token",
        },
        muteHttpExceptions: true,
      }))).thenReturn(instance(mockedNotFoundHTTPResponse));
  let urlFetchApp = instance(mockedUrlFetchApp);
  
  let firebaseAdaptor = new FirebaseImpl(urlFetchApp, scriptApp, propertiesService);
  describe('getDocument', () => {
    it('ok', () => {
      expect(firebaseAdaptor.getDocument('fdcData/12345')).to.deep.equal(TEST_DOCUMENT);
    });
    it('not found', () => {
      expect(firebaseAdaptor.getDocument('fdcData/11111')).to.deep.equal(null);
    });
  });
  describe('putDocument', () => {
    it('ok', () => {
      firebaseAdaptor.patchDocument('fdcData/23456', TEST_DOCUMENT);
      verify(mockedUrlFetchApp.fetch(
        'https://firestore.googleapis.com/v1/projects/project_name/databases/(default)/documents/fdcData/23456',
        deepEqual({
          method: "patch",
          headers: {
            "Content-type": "application/json",
            "Authorization": "Bearer oauth_token",
          },
          payload: JSON.stringify(TEST_DOCUMENT),
        }))).once();
    });
  });
});
