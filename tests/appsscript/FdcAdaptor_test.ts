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

import { TEST_SR_LEGACY_FOOD } from '../testData';

import { expect } from 'chai';
import 'mocha';
import { mock, instance, when } from 'ts-mockito';
import { FdcAdaptor } from '../../appsscript/FdcAdaptor';

describe('FdcAdaptor', () => {
  let mockedScriptProperties = mock<GoogleAppsScript.Properties.Properties>();
  when(mockedScriptProperties.getProperty('USDA_API_KEY')).thenReturn('abcde');
  let scriptProperties = instance(mockedScriptProperties);

  let mockedPropertiesService = mock<GoogleAppsScript.Properties.PropertiesService>();
  when(mockedPropertiesService.getScriptProperties()).thenReturn(scriptProperties);
  let propertiesService = instance(mockedPropertiesService);

  let mockedHTTPResponse = mock<GoogleAppsScript.URL_Fetch.HTTPResponse>();
  when(mockedHTTPResponse.getContentText()).thenReturn(JSON.stringify(TEST_SR_LEGACY_FOOD));

  let mockedUrlFetchApp = mock<GoogleAppsScript.URL_Fetch.UrlFetchApp>();
  when(mockedUrlFetchApp.fetch('https://api.nal.usda.gov/fdc/v1/12345?api_key=abcde')).thenReturn(
    instance(mockedHTTPResponse));
  let urlFetchApp = instance(mockedUrlFetchApp);

  let fdcAdaptor = new FdcAdaptor(urlFetchApp, propertiesService);
  describe('getFdcFood', () => {
    it('ok', () => {
      expect(fdcAdaptor.getFdcFood(12345)).to.deep.equal(TEST_SR_LEGACY_FOOD);
    })
  });
});
