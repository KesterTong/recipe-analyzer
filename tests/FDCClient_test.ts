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

import { FDCClient } from '../FDCClient';
import { TEST_SR_LEGACY_FOOD } from './testData';

import { expect } from 'chai';
import 'mocha';
import { mock, instance, when, verify } from 'ts-mockito';

describe('FoodDatabase', () => {
  let mockedUserCache: GoogleAppsScript.Cache.Cache = null;

  let mockedCacheService = mock<GoogleAppsScript.Cache.CacheService>();
  when(mockedCacheService.getUserCache()).thenCall(() => instance(mockedUserCache));
  let cacheService = instance(mockedCacheService);

  let mockedScriptProperties = mock<GoogleAppsScript.Properties.Properties>();
  when(mockedScriptProperties.getProperty('USDA_API_KEY')).thenReturn('abcde');
  let scriptProperties = instance(mockedScriptProperties);

  let mockedPropertiesService = mock<GoogleAppsScript.Properties.PropertiesService>();
  when(mockedPropertiesService.getScriptProperties()).thenReturn(scriptProperties);
  let propertiesService = instance(mockedPropertiesService);

  let globals = <any>global;
  globals['DocumentApp'] = instance(mock<GoogleAppsScript.Document.DocumentApp>());
  globals['CacheService'] = cacheService;
  globals['PropertiesService'] = propertiesService;

  let fdcClient = new FDCClient();
  it('cached', () => {
    mockedUserCache = mock<GoogleAppsScript.Cache.Cache>();
    when(mockedUserCache.get('11111')).thenReturn(JSON.stringify(TEST_SR_LEGACY_FOOD));
    expect(fdcClient.getFoodDetails({fdcId: 11111})).to.deep.equal(TEST_SR_LEGACY_FOOD);
    verify(mockedUserCache.put('11111', JSON.stringify(TEST_SR_LEGACY_FOOD), 21600)).once();
  });

  it('not cached', () => {
    mockedUserCache = mock<GoogleAppsScript.Cache.Cache>();
    let mockedHTTPResponse = mock<GoogleAppsScript.URL_Fetch.HTTPResponse>();
    when(mockedHTTPResponse.getContentText()).thenReturn(JSON.stringify(TEST_SR_LEGACY_FOOD));
    let mockedUrlFetchApp = mock<GoogleAppsScript.URL_Fetch.UrlFetchApp>();
    when(mockedUrlFetchApp.fetch('https://api.nal.usda.gov/fdc/v1/12345?api_key=abcde')).thenReturn(
      instance(mockedHTTPResponse));
      globals['UrlFetchApp'] = instance(mockedUrlFetchApp);
    expect(fdcClient.getFoodDetails({fdcId: 12345})).to.deep.equal(TEST_SR_LEGACY_FOOD);
    verify(mockedUserCache.put('12345', JSON.stringify(TEST_SR_LEGACY_FOOD), 21600)).once();
  });
});
