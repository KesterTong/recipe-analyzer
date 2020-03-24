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
import { RootState, ThunkDispatch } from "./store";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { nutrientsFromFoodDetails } from "../core/normalizeFood";
import { scaleNutrients } from "../core/Nutrients";
import { FoodViewerProps, FoodViewer } from "./FoodViewer";
import { setSelectedQuantity } from "./store/food_view/actions";
import { SRLegacyFood } from "../core/FoodDataCentral";
import { mergeIfStatePropsNotNull } from "./TypesUtil";

function mapStateToProps(state: RootState) {
  if (
    state.foodState?.stateType != "FoodView" ||
    state.foodState.food.dataType != "SR Legacy"
  ) {
    return null;
  }
  let quantities: { description: string; servings: number }[];
  quantities = [{ description: "100 g", servings: 1 }];
  const food = state.foodState.food;
  food.foodPortions.forEach((portion) => {
    let description =
      portion.amount.toString() +
      " " +
      portion.modifier +
      " (" +
      portion.gramWeight +
      " g)";
    quantities.push({ description, servings: portion.gramWeight / 100 });
  });
  let nutrientsPerServing = nutrientsFromFoodDetails(food, state.nutrientIds);
  let scale = quantities[state.foodState.selectedQuantity].servings;
  return {
    srLegacyFood: state.foodState.food,
    viewerProps: {
      nutrientNames: state.nutrientNames,
      nutrientValues: scaleNutrients(nutrientsPerServing, scale),
      quantities: quantities.map((quantity) => quantity.description),
      selectedQuantity: state.foodState.selectedQuantity,
    },
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators(
    {
      setSelectedQuantity,
    },
    dispatch
  );
}

export const FoodViewerContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeIfStatePropsNotNull
)(FoodViewer);
