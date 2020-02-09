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

import { IngredientDatabase } from '../IngredientDatabase';
import { TEST_SR_LEGACY_FOOD, TEST_RECIPE_DETAILS } from './testData';

import { expect } from 'chai';
import 'mocha';
import { mock, instance, when, verify, deepEqual } from 'ts-mockito';
import { FirebaseAdaptor } from '../appsscript/FirebaseAdaptor';
import { foodToDocument } from '../firebase/foodToDocument';
import { FdcAdaptor } from '../appsscript/FdcAdaptor';

describe('FoodDatabase', () => {
  let mockedPropertiesService = mock<GoogleAppsScript.Properties.PropertiesService>();
  let propertiesService = instance(mockedPropertiesService);

  let mockedFdcAdaptor = mock<FdcAdaptor>();
  when(mockedFdcAdaptor.getFdcFood(12345)).thenReturn(TEST_SR_LEGACY_FOOD);
  let fdcAdaptor = instance(mockedFdcAdaptor);

  let mockedFirebaseAdaptor = mock<FirebaseAdaptor>();
  when(mockedFirebaseAdaptor.getDocument('documents/fdcData/11111')).thenReturn(
    foodToDocument(TEST_SR_LEGACY_FOOD));
  let firebaseAdaptor = instance(mockedFirebaseAdaptor);

  let fdcClient = new IngredientDatabase(propertiesService, fdcAdaptor, firebaseAdaptor);
  it('ingredient in firebase', () => {
    expect(fdcClient.getFoodDetails('https://fdc.nal.usda.gov/fdc-app.html#/food-details/11111/nutrients')).to.deep.equal(TEST_SR_LEGACY_FOOD);
  });

  it('ingredient not in firebase', () => {
    expect(fdcClient.getFoodDetails('https://fdc.nal.usda.gov/fdc-app.html#/food-details/12345/nutrients')).to.deep.equal(TEST_SR_LEGACY_FOOD);
    verify(mockedFirebaseAdaptor.patchDocument(
      'documents/fdcData/12345',
      deepEqual(foodToDocument(TEST_SR_LEGACY_FOOD)))).once();
  });

  it('local', () => {
    fdcClient.addCustomFood('id.abc123', TEST_RECIPE_DETAILS);
    expect(fdcClient.getFoodDetails('#bookmark=id.abc123')).to.deep.equal(TEST_RECIPE_DETAILS);
  });

  it('local not found', () => {
    expect(fdcClient.getFoodDetails('#bookmark=id.def456')).to.equal(null);
  });
});
