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
import { scaleNutrients } from "./core/Nutrients";
import { FoodViewer } from "./FoodViewer";
import {
  actions,
  selectQuantities,
  selectNutrientsPerServing,
} from "./store/food_view";
import { mergeIfStatePropsNotNull } from "./TypesUtil";
import { selectNutrientNames, selectNutrientIds } from "./store/selectors";

function mapStateToProps(state: RootState) {
  if (state.foodState?.stateType != "FoodView") {
    return null;
  }
  const quantities = selectQuantities(state.foodState);
  const nutrientIds = selectNutrientIds(state);
  const nutrientNames = selectNutrientNames(state);
  let nutrientsPerServing = selectNutrientsPerServing(
    state.foodState,
    nutrientIds
  );
  let scale = quantities[state.foodState.selectedQuantity].servings;
  return {
    srLegacyFood: state.foodState.food,
    viewerProps: {
      nutrientNames,
      nutrientValues: scaleNutrients(nutrientsPerServing, scale),
      quantities: quantities.map((quantity) => quantity.description),
      selectedQuantity: state.foodState.selectedQuantity,
    },
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators(actions, dispatch);
}

export const FoodViewerContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeIfStatePropsNotNull
)(FoodViewer);
