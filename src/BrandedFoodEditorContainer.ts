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
import { RootState } from "./store";
import { connect } from "react-redux";
import { updateDescription } from "./store/branded_food_edit/actions";
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "redux-thunk";
import {
  updateServingSize,
  updateServingSizeUnit,
  updateHouseholdUnit,
  updateNutrientValue,
} from "./store/branded_food_edit/actions";
import { RootAction } from "./store/types";
import { BrandedFoodEditor } from "./BrandedFoodEditor";

function mapStateToProps(state: RootState) {
  if (state.foodState?.stateType != "BrandedFoodEdit") {
    return {
      hasBrandedFood: false,
      description: "",
      householdServingFullText: "",
      servingSize: "",
      servingSizeUnit: "",
      nutrients: [],
    };
  }
  const edits = state.foodState;
  const nutrientsById: { [index: number]: string } = {};
  edits.foodNutrients.forEach(({ id, amount }) => {
    nutrientsById[id] = amount;
  });
  return {
    hasBrandedFood: true,
    description: edits.description,
    householdServingFullText: edits.householdServingFullText || "",
    servingSize: edits.servingSize,
    servingSizeUnit: edits.servingSizeUnit,
    nutrients: state.nutrientIds.map((id, index) => ({
      id,
      description: state.nutrientNames[index],
      value: nutrientsById[id],
    })),
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<RootState, null, RootAction>
) {
  return bindActionCreators(
    {
      updateDescription,
      updateServingSize,
      updateServingSizeUnit,
      updateHouseholdUnit,
      updateNutrientValue,
    },
    dispatch
  );
}

export const BrandedFoodEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BrandedFoodEditor);
