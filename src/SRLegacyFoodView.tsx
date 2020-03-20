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
import { RootState } from "./store";
import { NutrientsViewerContainer } from "./NutrientsViewerContainer";
import { connect } from "react-redux";
import * as React from 'react';

const SRLegacyFoodViewerView: React.SFC<{food: SRLegacyFood | null}> = (props) => {
  let food = props.food;
  if (food == null) {
    return null;
  }
  // TODO new id instead of description for key.
  return <React.Fragment>
    <h1>{food.description}</h1>
    <h2>Nutrients</h2>
    <NutrientsViewerContainer/>
  </React.Fragment>;
}

function mapStateToProps(state: RootState) {
  return {food: state.srLegacyFood};
}

export const SRLegacyFoodViewer = connect(mapStateToProps)(SRLegacyFoodViewerView);