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
import { getFood, insertFood, patchFood } from "../../src/database";
import { store, RootState } from "../../src/store";
import {
  selectAndMaybeLoad,
  newRecipe,
  saveFood,
} from "../../src/store/actions";
import { TEST_BRANDED_FOOD } from "../testData";
import { NEW_RECIPE } from "../../src/store/recipe_edit/conversion";
import { initialState } from "../../src/store/types";
import { updateDescription as updateBrandedFoodDescription } from "../../src/store/branded_food_edit/actions";
import { State as BrandedFoodEdits } from "../../src/store/branded_food_edit/types";

jest.mock("../../src/database");

const _TEST_BRANDED_FOOD_EDITS: BrandedFoodEdits = {
  stateType: "BrandedFoodEdit",
  description: "Plantain Chips",
  foodNutrients: [
    { amount: "170", id: 1008 },
    { amount: "2", id: 1003 },
  ],
  householdServingFullText: "6 pieces",
  selectedQuantity: 0,
  servingSize: "40",
  servingSizeUnit: "g",
};

describe("actions", () => {
  const getFoodMock = getFood as jest.MockedFunction<typeof getFood>;
  const insertFoodMock = insertFood as jest.MockedFunction<typeof insertFood>;
  const patchFoodMock = patchFood as jest.MockedFunction<typeof patchFood>;

  afterEach(() => {
    getFoodMock.mockReset();
    insertFoodMock.mockReset();
    patchFoodMock.mockReset();
  });

  it("SelectFood_Branded", async () => {
    getFoodMock.mockResolvedValue(TEST_BRANDED_FOOD);
    let actionCompleted = store.dispatch(
      selectAndMaybeLoad("userData/abcdefg", "My Food")
    );
    expect(store.getState()).toEqual<RootState>({
      ...initialState,
      foodInput: {
        description: "My Food",
        foodId: "userData/abcdefg",
        deselected: false,
      },
      foodState: {
        stateType: "Loading",
      },
    });
    await actionCompleted;
    expect(store.getState()).toEqual<RootState>({
      ...initialState,
      foodInput: {
        description: "My Food",
        foodId: "userData/abcdefg",
        deselected: false,
      },
      foodState: _TEST_BRANDED_FOOD_EDITS,
    });
    expect(getFoodMock.mock.calls).toEqual([["userData/abcdefg"]]);
  });

  it("UpdateDescriptionAndSave", async () => {
    getFoodMock.mockResolvedValue(TEST_BRANDED_FOOD);
    await store.dispatch(selectAndMaybeLoad("userData/abcdefg", "My Food"));
    store.dispatch(updateBrandedFoodDescription("New Description"));
    expect(store.getState()).toEqual<RootState>({
      ...initialState,
      foodInput: {
        description: "My Food",
        foodId: "userData/abcdefg",
        deselected: false,
      },
      foodState: {
        ..._TEST_BRANDED_FOOD_EDITS,
        description: "New Description",
      },
    });
    await store.dispatch(saveFood());
    expect(store.getState()).toEqual<RootState>({
      ...initialState,
      foodInput: {
        description: "My Food",
        foodId: "userData/abcdefg",
        deselected: false,
      },
      foodState: {
        ..._TEST_BRANDED_FOOD_EDITS,
        description: "New Description",
      },
    });
    expect(getFoodMock.mock.calls).toEqual([["userData/abcdefg"]]);
    expect(patchFoodMock.mock.calls).toEqual([
      [
        "userData/abcdefg",
        { ...TEST_BRANDED_FOOD, description: "New Description" },
      ],
    ]);
  });

  it("New Recipe", async () => {
    insertFoodMock.mockResolvedValue("userData/abcdefg");
    await store.dispatch(newRecipe());
    expect(store.getState()).toEqual<RootState>({
      ...initialState,
      foodInput: {
        description: "New Recipe",
        foodId: "userData/abcdefg",
        deselected: false,
      },
      foodState: {
        stateType: "RecipeEdit",
        description: "New Recipe",
        ingredients: [],
      },
    });
    expect(insertFoodMock.mock.calls).toEqual([[NEW_RECIPE]]);
  });
});
