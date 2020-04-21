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
import { actions } from "./store/branded_food_edit";
import { bindActionCreators } from "redux";
import { ThunkDispatch, getNutrientNames, getNutrientIds } from "./store";
import { BrandedFoodEditor } from "./BrandedFoodEditor";

function mapStateToProps(state: RootState) {
  if (state.foodState?.stateType != "BrandedFoodEdit") {
    return <typeof result>{};
  }
  const edits = state.foodState;
  const nutrientsById: { [index: number]: string } = {};
  const nutrientNames = getNutrientNames(state);
  edits.foodNutrients.forEach(({ id, amount }) => {
    nutrientsById[id] = amount;
  });
  const result = {
    description: edits.description,
    householdServingFullText: edits.householdServingFullText || "",
    servingSize: edits.servingSize,
    servingSizeUnit: edits.servingSizeUnit,
    nutrients: state.config.nutrientInfos.map((nutrientInfo, index) => ({
      id: nutrientInfo.id,
      description: nutrientNames[index],
      value: nutrientsById[nutrientInfo.id],
    })),
  };
  return result;
}

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators(actions, dispatch);
}

export const BrandedFoodEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BrandedFoodEditor);
