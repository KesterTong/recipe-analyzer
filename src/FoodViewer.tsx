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
import { SRLegacyFood } from "./core/FoodDataCentral";
import * as React from "react";
import { NutrientsViewer } from "./NutrientsViewer";
import { isNonEmpty } from "./TypesUtil";

export interface FoodViewerProps {
  srLegacyFood: SRLegacyFood;
  viewerProps: {
    nutrientNames: string[];
    nutrientValues: number[];
    quantities: string[];
    selectedQuantity: number;
  };
  setSelectedQuantity: (index: number) => void;
}

export const FoodViewer: React.FunctionComponent<FoodViewerProps | {}> = (
  props
) => {
  if (!isNonEmpty(props)) {
    return null;
  }
  // TODO new id instead of description for key.
  return (
    <React.Fragment>
      <h1>{props.srLegacyFood.description}</h1>
      <h2>Nutrients</h2>
      <NutrientsViewer
        {...props.viewerProps}
        setSelectedQuantity={props.setSelectedQuantity}
      />
    </React.Fragment>
  );
};
