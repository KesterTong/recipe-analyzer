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
import * as React from "react";
import { MaybeComponent } from "./MaybeComponent";

export interface StateProps {
  recipeTitles: string[];
  selectedRecipeIndex: number;
}

interface DispatchProps {
  selectRecipe: (value: number) => void;
}

export const RecipeInput = MaybeComponent<StateProps, DispatchProps>(
  (props) => (
    <div className="block form-group">
      <label htmlFor="recipe">Selected Recipe</label>
      <div className="control-group">
        <select
          value={props.selectedRecipeIndex}
          onChange={(event) => props.selectRecipe(Number(event.target.value))}
          id="recipe"
        >
          {props.recipeTitles.map((title, index) => (
            <option value={index}>{title}</option>
          ))}
        </select>
      </div>
    </div>
  )
);
