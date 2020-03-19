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
import { getFood, insertFood } from '../../src/IngredientDatabaseImpl';
import { store, RootState } from '../../src/store';
import { selectFood, newRecipe } from '../../src/store/actions';
import { TEST_BRANDED_FOOD } from '../testData';
import { NEW_RECIPE } from '../../src/store/recipe/conversion';

jest.mock('../../src/IngredientDatabaseImpl');

describe('actions', () => {
  const getFoodMock = getFood as jest.MockedFunction<typeof getFood>;
  const insertFoodMock = insertFood as jest.MockedFunction<typeof insertFood>;

  it('SelectFood', async () => {
    getFoodMock.mockReset();
    getFoodMock.mockResolvedValue(TEST_BRANDED_FOOD);
    let actionCompleted = store.dispatch(selectFood([{value: 'userData/abcdefg', label: 'My Food'}]));
    expect(store.getState()).toEqual<RootState>({
      selectedFoodId: "userData/abcdefg",
      deselected: false,
      food: {
        dataType: "Loading",
        description: "My Food",
      },  
      nutrientInfos: null,
    });
    await actionCompleted;
    expect(store.getState()).toEqual<RootState>({
      selectedFoodId: "userData/abcdefg",
      deselected: false,
      food: {
        dataType: "Branded Edit",
        description: "Plantain Chips",
        foodNutrients: [
          {
            amount: "170",
            id: 1008,
          }, {
            amount: "2",
            id: 1003,
          },
        ],
        householdServingFullText: "6 pieces",
        selectedQuantity: 0,
        servingSize: "40",
        servingSizeUnit: "g",
      },  
      nutrientInfos: null,
    });
    expect(getFoodMock.mock.calls).toEqual([['userData/abcdefg']])
  });
  it('New Recipe', async () => {
    insertFoodMock.mockReset();
    insertFoodMock.mockResolvedValue('userData/abcdefg');
    await store.dispatch(newRecipe());
    expect(store.getState()).toEqual<RootState>({
      selectedFoodId: "userData/abcdefg",
      deselected: false,
      food: {
        dataType: "Recipe Edit",
        description: "New Recipe",
        foodsById: {},
        ingredients: [],
      },
      nutrientInfos: null,
    });
    expect(insertFoodMock.mock.calls).toEqual([[NEW_RECIPE]])
  });
});
