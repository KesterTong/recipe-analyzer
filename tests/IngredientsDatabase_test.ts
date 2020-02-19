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

import { IngredientDatabase } from '../core/IngredientDatabase';
import { TEST_SR_LEGACY_FOOD, TEST_RECIPE_DETAILS } from './testData';

import { expect } from 'chai';
import 'mocha';
import { mock, instance, when, verify, deepEqual } from 'ts-mockito';
import { FirebaseImpl } from '../appsscript/FirebaseImpl';
import { FoodDataCentralImpl } from '../appsscript/FoodDataCentralImpl';
import { IngredientDatabaseImpl } from '../appsscript/IngredientDatabaseImpl';

describe('IngredientDatabase', () => {
  let mockedFdcAdaptor = mock<FoodDataCentralImpl>();
  when(mockedFdcAdaptor.getFdcFood(12345)).thenReturn(TEST_SR_LEGACY_FOOD);
  let fdcAdaptor = instance(mockedFdcAdaptor);

  let mockedFirebaseAdaptor = mock<FirebaseImpl>();
  when(mockedFirebaseAdaptor.getDocument('fdcData/11111')).thenReturn({
    fields: {
      version: {stringValue: '0.1'},
      data: {stringValue: JSON.stringify(TEST_SR_LEGACY_FOOD),
      }
    }
  });
  when(mockedFirebaseAdaptor.getDocument('userData/id.abc123')).thenReturn({
    fields: {
      version: {stringValue: '0.1'},
      data: {stringValue: JSON.stringify(TEST_RECIPE_DETAILS),
      }
    }
  });
  let firebaseAdaptor = instance(mockedFirebaseAdaptor);

  let fdcClient = new IngredientDatabaseImpl(fdcAdaptor, firebaseAdaptor);
  it('ingredient in firebase', () => {
    expect(fdcClient.getFood({identifierType: 'FdcId', fdcId: 11111})).to.deep.equal(TEST_SR_LEGACY_FOOD);
  });

  it('ingredient not in firebase', () => {
    expect(fdcClient.getFood({identifierType: 'FdcId', fdcId: 12345})).to.deep.equal(TEST_SR_LEGACY_FOOD);
    verify(mockedFirebaseAdaptor.patchDocument(
      'fdcData/12345',
      deepEqual({
        fields: {
          version: {stringValue: '0.1'},
          data: {stringValue: JSON.stringify(TEST_SR_LEGACY_FOOD),
          }
        }
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
    verify(mockedFirebaseAdaptor.patchDocument(
      'userData/id.abc123',
      deepEqual({
        fields: {
          version: {stringValue: '0.1'},
          data: {stringValue: JSON.stringify(TEST_RECIPE_DETAILS),
          }
        }
      }))).once();
  });
});
