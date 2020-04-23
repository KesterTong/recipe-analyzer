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
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  getDisplayQuantities,
  nutrientsPerServingForFood,
  servingEquivalentQuantities,
  isOk,
} from "./core";
import { FoodViewer } from "./FoodViewer";
import { RootState, ThunkDispatch } from "./store";
import { actions } from "./store/food_view";
import { nutrientsForQuantity } from "./core";

function mapStateToProps(state: RootState) {
  if (state.foodState?.stateType != "FoodView") {
    return <typeof result>{};
  }
  const food = state.foodState.food;
  const selectedQuantity = state.foodState.selectedQuantity;
  const quantities = getDisplayQuantities(food);
  const nutrientInfos = state.config.nutrientInfos;
  const nutrientsPerServing = nutrientsPerServingForFood(food);
  const nutrients = isOk(nutrientsPerServing)
    ? nutrientsForQuantity(
        selectedQuantity.amount,
        selectedQuantity.unit,
        servingEquivalentQuantities(food),
        nutrientsPerServing
      )
    : nutrientsPerServing;

  const result = {
    food: state.foodState.food,
    nutrientInfos,
    nutrients,
    quantities,
    selectedQuantity: state.foodState.selectedQuantity,
  };
  return result;
}

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators(actions, dispatch);
}

export const FoodViewerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FoodViewer);
