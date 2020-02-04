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

import { parseQuantity } from '../../core/parseQuantity';
import { expect } from 'chai';
import { mock, when, instance } from 'ts-mockito';

describe('parseQuantity', () => {
  it('no unit', () => {
    expect(parseQuantity('1')).to.deep.equal({
      amount: 1.0,
      unit: 'serving'
    });
  });
  it('number', () => {
    expect(parseQuantity('1 cup')).to.deep.equal({
      amount: 1.0,
      unit: 'cup'
    });
  });
  it('number with decimel', () => {
    expect(parseQuantity('1.5 cup')).to.deep.equal({
      amount: 1.5,
      unit: 'cup'
    });
  });
  it('number with trailing decimal point', () => {
    expect(parseQuantity('1. cup')).to.deep.equal({
      amount: 1.0,
      unit: 'cup'
    });
  });
  it('pure fraction', () => {
    expect(parseQuantity('½ cup')).to.deep.equal({
      amount: 0.5,
      unit: 'cup'
    });
  });
  it('compound fraction', () => {
    expect(parseQuantity('1½ cup')).to.deep.equal({
      amount: 1.5,
      unit: 'cup'
    });
  });
});
