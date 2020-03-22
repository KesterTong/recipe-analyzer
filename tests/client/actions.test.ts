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
import { getFood, insertFood, patchFood } from '../../src/IngredientDatabaseImpl';
import { store, RootState, BrandedFoodState } from '../../src/store';
import { select, newRecipe, updateDescription, saveFood } from '../../src/store/actions';
import { TEST_BRANDED_FOOD } from '../testData';
import { NEW_RECIPE } from '../../src/store/recipe/conversion';
import { initialState } from '../../src/store/types';
import { Edits as BrandedFoodEdits } from '../../src/store/branded_food/types';

jest.mock('../../src/IngredientDatabaseImpl');

const _TEST_BRANDED_FOOD_EDITS: BrandedFoodEdits = {
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
  const patchFoodMock = patchFood as jest.MockedFunction<typeof patchFood>;

  afterEach(() => {
    getFoodMock.mockReset();
    insertFoodMock.mockReset();
    patchFoodMock.mockReset();
  });

  it('SelectFood_Branded', async () => {
    getFoodMock.mockResolvedValue(TEST_BRANDED_FOOD);
    let actionCompleted = store.dispatch(select({foodId: 'userData/abcdefg', description: 'My Food'}));
    expect(store.getState()).toEqual<RootState>({
      ...initialState,
      selectedFood: {
        foodRef: {
          foodId: "userData/abcdefg",
          description: 'My Food',
        },
        deselected: false,
      }
    });
    await actionCompleted;
    expect(store.getState()).toEqual<RootState>({
      ...initialState,
      selectedFood: {
        foodRef: {
          foodId: "userData/abcdefg",
          description: 'Plantain Chips',
        },
        deselected: false,
      },
      brandedFoodState: {
        food: TEST_BRANDED_FOOD,
        edits: _TEST_BRANDED_FOOD_EDITS,
      },
    });
    expect(getFoodMock.mock.calls).toEqual([['userData/abcdefg']]);
  });
  
  it('UpdateDescriptionAndSave', async () => {
    getFoodMock.mockResolvedValue(TEST_BRANDED_FOOD);
    await store.dispatch(select({foodId: 'userData/abcdefg', description: 'My Food'}));
    store.dispatch(updateDescription('New Description'));
    expect(store.getState()).toEqual<RootState>({
      ...initialState,
      selectedFood: {
        foodRef: {
          foodId: "userData/abcdefg",
          description: 'New Description',
        },
        deselected: false,
      },
      brandedFoodState: {
        food: TEST_BRANDED_FOOD,
        edits: {
          ..._TEST_BRANDED_FOOD_EDITS,
          description: 'New Description',
        },
      },
    });
    await store.dispatch(saveFood());
    expect(store.getState()).toEqual<RootState>({
      ...initialState,
      selectedFood: {
        foodRef: {
          foodId: "userData/abcdefg",
          description: 'New Description',
        },
        deselected: false,
      },
      brandedFoodState: {
        food: {
          ...TEST_BRANDED_FOOD,
          description: 'New Description',
        },
        edits: {
          ..._TEST_BRANDED_FOOD_EDITS,
          description: 'New Description',
        },
      },
    })
    expect(getFoodMock.mock.calls).toEqual([['userData/abcdefg']]);
    expect(patchFoodMock.mock.calls).toEqual([
      [
        'userData/abcdefg',
        {...TEST_BRANDED_FOOD, description: 'New Description'}
      ]
    ]);
  });
  
  it('New Recipe', async () => {
    insertFoodMock.mockResolvedValue('userData/abcdefg');
    await store.dispatch(newRecipe());
    expect(store.getState()).toEqual<RootState>({
      ...initialState,
      selectedFood: {
        foodRef: {
          foodId: "userData/abcdefg",
          description: 'New Recipe',
        },
        deselected: false,
      },
      recipeState: {
        description: "New Recipe",
        ingredients: [],
      },
    });
    expect(insertFoodMock.mock.calls).toEqual([[NEW_RECIPE]])
  });
});
