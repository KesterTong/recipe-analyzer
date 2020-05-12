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

// TODO: make selected a controlled property.
export const Dropdown: React.FunctionComponent<{
  id: string;
  label: string;
  options: string[];
}> = (props) => {
  return (
    <div className="block form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <select id={props.id}>
        {props.options.map((option, index) => (
          <option selected={index == 0}>{option}</option>
        ))}
      </select>
    </div>
  );
};
