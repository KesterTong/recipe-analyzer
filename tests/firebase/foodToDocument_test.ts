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

import { expect } from 'chai';
import 'mocha';
import { foodToDocument } from '../../firebase/foodToDocument';
import { TEST_SR_LEGACY_FOOD } from '../testData';

describe('foodToDocument', () => {
  it('ok', () => {
    expect(foodToDocument(TEST_SR_LEGACY_FOOD)).to.deep.equal({
      fields: {
        version: {stringValue: '0.1'},
        data: {stringValue: JSON.stringify(TEST_SR_LEGACY_FOOD)},
      }
    });
  });
});
