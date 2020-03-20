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
import { store, RootState, BrandedFoodState } from '../../src/store';
import { selectFood, newRecipe, updateDescription } from '../../src/store/actions';
import { TEST_BRANDED_FOOD } from '../testData';
import { NEW_RECIPE } from '../../src/store/recipe/conversion';
import { initialState } from '../../src/store/types';

jest.mock('../../src/IngredientDatabaseImpl');

const _TEST_BRANDED_FOOD_EDIT: BrandedFoodState = {
  dataType: "Branded Edit",
  description: "Plantain Chips",
  foodNutrients: [
    {amount: "170", id: 1008},
    {amount: "2", id: 1003},
  ],
  householdServingFullText: "6 pieces",
  selectedQuantity: 0,
  servingSize: "40",
  servingSizeUnit: "g",
};

describe('actions', () => {
  const getFoodMock = getFood as jest.MockedFunction<typeof getFood>;
  const insertFoodMock = insertFood as jest.MockedFunction<typeof insertFood>;

  it('SelectFood_Branded', async () => {
    getFoodMock.mockReset();
    getFoodMock.mockResolvedValue(TEST_BRANDED_FOOD);
    let actionCompleted = store.dispatch(selectFood([{value: 'userData/abcdefg', label: 'My Food'}]));
    expect(store.getState()).toEqual<RootState>({
      ...initialState,
      selectedFood: {
        foodId: "userData/abcdefg",
        description: 'My Food',
        deselected: false,
      }
    });
    await actionCompleted;
    expect(store.getState()).toEqual<RootState>({
      ...initialState,
      selectedFood: {
        foodId: "userData/abcdefg",
        description: 'Plantain Chips',
        deselected: false,
      },
      brandedFoodState: _TEST_BRANDED_FOOD_EDIT,
    });
    expect(getFoodMock.mock.calls).toEqual([['userData/abcdefg']])
  });
  
  it('UpdateDescription', async () => {
    getFoodMock.mockReset();
    getFoodMock.mockResolvedValue(TEST_BRANDED_FOOD);
    await store.dispatch(selectFood([{value: 'userData/abcdefg', label: 'My Food'}]));
    store.dispatch(updateDescription('New Description'));
    expect(store.getState()).toEqual<RootState>({
      ...initialState,
      selectedFood: {
        foodId: "userData/abcdefg",
        description: 'Plantain Chips',
        deselected: false,
      },
      brandedFoodState: {..._TEST_BRANDED_FOOD_EDIT, description: 'New Description'},
    });
  });
  
  it('New Recipe', async () => {
    insertFoodMock.mockReset();
    insertFoodMock.mockResolvedValue('userData/abcdefg');
    await store.dispatch(newRecipe());
    expect(store.getState()).toEqual<RootState>({
      ...initialState,
      selectedFood: {
        foodId: "userData/abcdefg",
        description: 'New Recipe',
        deselected: false,
      },
      recipeState: {
        dataType: "Recipe Edit",
        description: "New Recipe",
        foodsById: {},
        ingredients: [],
      },
    });
    expect(insertFoodMock.mock.calls).toEqual([[NEW_RECIPE]])
  });
});
