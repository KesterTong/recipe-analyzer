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
import { addNutrients, scaleNutrients } from '../../core/Nutrients';

describe('scaleNutrients', () => {
  it('scaleNutrients', () => {
    expect(scaleNutrients({1008: 10, 1003: 20}, 2)).to.deep.equal(
      {1008: 20, 1003: 40});
  });
});

describe('addNutrients', () => {
  it('sameKeys', () => {
    expect(addNutrients({1008: 10, 1003: 20}, {1008: 5, 1003: 2})).to.deep.equal(
      {1008: 15, 1003: 22});
  });
  it('differentKeys', () => {
    expect(addNutrients({1008: 10, 1004: 20}, {1008: 5, 1003: 2})).to.deep.equal(
      {1008: 15, 1004:20, 1003: 2});
  });
});
