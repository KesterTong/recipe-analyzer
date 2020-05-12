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
import { Database } from "./Database";
import { Dropdown } from "./Dropdown";

interface MainProps {
  database: Database;
  recipeNames: string[];
}

export const Main: React.FunctionComponent<MainProps> = (props) => {
  return (
    <React.Fragment>
      <Dropdown
        id="recipe"
        label="Selected Recipe"
        options={props.recipeNames}
      />
      <Dropdown
        id="ingredient"
        label="Selected Ingredient"
        options={["1 cup flour", "1 potato"]}
      />
      <div className="block form-group button-group">
        <button>Delete</button>
        <button>Insert Above</button>
        <button>Insert Below</button>
      </div>
    </React.Fragment>
  );
};
