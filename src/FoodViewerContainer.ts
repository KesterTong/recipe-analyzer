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
import { scaleNutrients } from "./core";
import { FoodViewer } from "./FoodViewer";
import {
  RootState,
  ThunkDispatch,
  getNutrientNames,
  getNutrientIds,
} from "./store";
import {
  actions,
  selectQuantities,
  selectNutrientsPerServing,
} from "./store/food_view";

function mapStateToProps(state: RootState) {
  if (state.foodState?.stateType != "FoodView") {
    return <typeof result>{};
  }
  const quantities = selectQuantities(state.foodState);
  const nutrientIds = getNutrientIds(state);
  const nutrientNames = getNutrientNames(state);
  const nutrientsPerServing = selectNutrientsPerServing(
    state.foodState,
    nutrientIds
  );
  const scale = quantities[state.foodState.selectedQuantity].servings;
  const result = {
    food: state.foodState.food,
    nutrientNames,
    nutrientValues: scaleNutrients(nutrientsPerServing, scale),
    quantities: quantities.map((quantity) => quantity.description),
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
