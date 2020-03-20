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
import { RootState, BrandedFoodState, RecipeState } from "./store";
import { connect } from 'react-redux';
import { ThunkDispatch } from './store/types';
import { NutrientsViewer } from './NutrientsViewer';
import { SRLegacyFood } from "../core/FoodDataCentral";

function mapStateToProps(state: RootState) {
  let food: SRLegacyFood | BrandedFoodState | RecipeState | null;  //state.food;
  //if (food == null || food.dataType == 'Branded Edit' || state.nutrientInfos == null) {
    return {
      nutrientNames: [],
      nutrientValues: [],
      quantities: ['-'],
      selectedQuantity: 0,
    };
  // }
  // let quantities: {description: string, servings: number}[];
  // let nutrientsPerServing: Nutrients;
  // switch (food.dataType) {
  //   case 'Loading':
  //     quantities = [];
  //     nutrientsPerServing = [];
  //     break;
  //   case 'Recipe Edit':
  //     quantities = [{description: '1 serving', servings: 1}];
  //     // TODO: store nutrients per serving in separate part of state.
  //     nutrientsPerServing = state.nutrientInfos.map(nutrientInfo => 0);
  //     break;
  //   case 'SR Legacy':
  //     quantities = [{description: '100 g', servings: 1}];
  //     food.foodPortions.forEach(portion => {
  //       let description = portion.amount.toString() + ' ' + portion.modifier + ' (' + portion.gramWeight + ' g)';
  //       quantities.push({description, servings: portion.gramWeight / 100});
  //     });
  //     nutrientsPerServing = nutrientsFromFoodDetails(food, state.nutrientInfos.map(nutrientInfo => nutrientInfo.id));
  //     break;
  // }
  // let scale = quantities[0].servings;
  // return {
  //   nutrientNames: state.nutrientInfos.map(nutrientInfo => nutrientInfo.name),
  //   nutrientValues: scaleNutrients(nutrientsPerServing, scale),
  //   quantities: quantities.map(quantity => quantity.description),
  //   selectedQuantity: 0,
  // };
}

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return {
    selectQuantity: (event: React.FormEvent) => {
      if (event.target instanceof HTMLSelectElement) {
        // dispatch({
        //   type: 'SetSelectedQuantity',
        //   index: Number(event.target.value),
        // });
      }
    }
  };
}

export const NutrientsViewerContainer = connect(mapStateToProps, mapDispatchToProps)(NutrientsViewer);