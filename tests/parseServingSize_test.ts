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

import { parseServingSize } from '../parseServingSize';
import { expect } from 'chai';
import 'mocha';

describe('parseFood', () => {
  it('100 g', () => {
    expect(parseServingSize('100 g\n1 tablespoon = 13.5 g\n1 cup = 216 g\n1 tsp = 4.5 g')).to.deep.equal([
      {amount: 100, unit: 'g'},
      {amount: 100 / 13.5, unit: 'tablespoon'},
      {amount: 100 / 216, unit: 'cup'},
      {amount: 100 / 4.5, unit: 'tsp'},
    ]);
  });

  it('1 cup (240 ml)', () => {
    expect(parseServingSize('1 cup (240 ml)')).to.deep.equal([
      {amount: 1, unit: 'cup'},
      {amount: 240, unit: 'ml'},
    ]);
  });
});
