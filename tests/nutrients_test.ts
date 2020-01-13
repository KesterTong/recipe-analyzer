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

import { scaleNutrients, addNutrients } from '../nutrients';
import { expect } from 'chai';
import 'mocha';

describe('scaleNutrients', () => {
  it('scaleNutrients', () => {
    expect(scaleNutrients({calories: 10, protein: 20}, 2)).to.deep.equal(
      {calories: 20, protein: 40});
  });
});

describe('addNutrients', () => {
  it('sameKeys', () => {
    expect(addNutrients({calories: 10, protein: 20}, {calories: 5, protein: 2})).to.deep.equal(
      {calories: 15, protein: 22});
  });
  it('differentKeys', () => {
    expect(addNutrients({calories: 10, fat: 20}, {calories: 5, protein: 2})).to.deep.equal(
      {calories: 15, fat:20, protein: 2});
  });
});
