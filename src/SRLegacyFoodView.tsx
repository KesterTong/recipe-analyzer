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
import { SRLegacyFood } from "../core/FoodDataCentral";
import { RootState, ThunkDispatch } from "./store";
import { connect } from "react-redux";
import * as React from 'react';
import { NutrientsViewer } from "./NutrientsViewer";
import { bindActionCreators } from "redux";
import { setSelectedQuantity } from "./store/actions";
import { nutrientsFromFoodDetails } from "../core/normalizeFood";
import { scaleNutrients } from "../core/Nutrients";

interface SRLegacyFoodProps {
  srLegacyFood: SRLegacyFood,
  viewerProps: {
    nutrientNames: string[],
    nutrientValues: number[],
    quantities: string[],
    selectedQuantity: number,
  },
}

interface SRLegacyFoodViewerProps {
  srLegacyFoodProps: SRLegacyFoodProps | null,
  setSelectedQuantity: (index: number) => void,
}

const SRLegacyFoodViewerView: React.SFC<SRLegacyFoodViewerProps> = (props) => {
  let food = props.srLegacyFoodProps;
  if (food == null) {
    return null;
  }
  // TODO new id instead of description for key.
  return <React.Fragment>
    <h1>{food.srLegacyFood.description}</h1>
    <h2>Nutrients</h2>
    <NutrientsViewer {...food.viewerProps} setSelectedQuantity={props.setSelectedQuantity}/>
  </React.Fragment>;
}

function mapStateToProps(state: RootState) {
  let srLegacyFoodProps: SRLegacyFoodProps |  null;
  if (state.srLegacyFoodState == null) {
    srLegacyFoodProps = null;
  } else {
    let quantities: {description: string, servings: number}[];
    quantities = [{description: '100 g', servings: 1}];
    const food = state.srLegacyFoodState.srLegacyFood;
    food.foodPortions.forEach(portion => {
      let description = portion.amount.toString() + ' ' + portion.modifier + ' (' + portion.gramWeight + ' g)';
      quantities.push({description, servings: portion.gramWeight / 100});
    });
    let nutrientsPerServing = nutrientsFromFoodDetails(food, state.nutrientIds);
    let scale = quantities[state.srLegacyFoodState.selectedQuantity].servings;
    srLegacyFoodProps = {
      srLegacyFood: state.srLegacyFoodState.srLegacyFood,
      viewerProps: {
        nutrientNames: state.nutrientNames,
        nutrientValues: scaleNutrients(nutrientsPerServing, scale),
        quantities: quantities.map(quantity => quantity.description),
        selectedQuantity: state.srLegacyFoodState.selectedQuantity,
      },
    };
  }
  return {srLegacyFoodProps};
}

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators({
    setSelectedQuantity,
  }, dispatch);
}

export const SRLegacyFoodViewer = connect(mapStateToProps, mapDispatchToProps)(SRLegacyFoodViewerView);