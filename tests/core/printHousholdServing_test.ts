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

import { printHouseholdServing } from '../../core/printHouseholdServing';
import { expect } from 'chai';
import 'mocha';

describe('printHouseholdServing', () => {
  it('1 cup (240 ml)', () => {
    expect(printHouseholdServing({
      servingSize: 240.0,
      servingSizeUnit: 'ml',
      householdServingFullText: '1 cup',
    })).to.equal('1 cup (240 ml)');
  });
  it('240 ml', () => {
    expect(printHouseholdServing({
      servingSize: 240.0,
      servingSizeUnit: 'ml',
      householdServingFullText: null,
    })).to.equal('240 ml');
  });
});