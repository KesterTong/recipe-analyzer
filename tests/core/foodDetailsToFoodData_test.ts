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

import { foodDetailsToFoodData } from '../../core/foodDetailsToFoodData';
import { TEST_SR_LEGACY_FOOD, TEST_SR_LEGACY_FOOD_DATA, TEST_BRANDED_FOOD, TEST_BRANDED_FOOD_DATA } from '../testData';

import { expect } from 'chai';
import 'mocha';

describe('foodDetailsToFoodData', () => {
  it('SR legacy food', () => {
    expect(foodDetailsToFoodData(TEST_SR_LEGACY_FOOD)).to.deep.equal(TEST_SR_LEGACY_FOOD_DATA);
  });

  it('branded food', () => {
    expect(foodDetailsToFoodData(TEST_BRANDED_FOOD)).to.deep.equal(TEST_BRANDED_FOOD_DATA);
  });
});
