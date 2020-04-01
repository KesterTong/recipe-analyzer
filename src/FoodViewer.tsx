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
import { Food } from "./core";
import * as React from "react";
import { NutrientsViewer } from "./NutrientsViewer";

export interface FoodViewerProps {
  food: Food;
  viewerProps: {
    nutrientNames: string[];
    nutrientValues: number[];
    quantities: string[];
    selectedQuantity: number;
  };
  setSelectedQuantity: (index: number) => void;
}

export const NO_DISPLAY = {} as FoodViewerProps;

export const FoodViewer: React.FunctionComponent<FoodViewerProps> = (
  props
) => {
  if (props.food === undefined) {
    return null;
  }
  return (
    <React.Fragment>
      <h1>{props.food.description}</h1>
      <h2>Nutrients</h2>
      <NutrientsViewer
        {...props.viewerProps}
        setSelectedQuantity={props.setSelectedQuantity}
      />
    </React.Fragment>
  );
};
