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
import { EditorContainer } from "./EditorContainer";

export interface MainProps {
  // TODO: use some kind of union type here.
  type: "Active" | "Error" | "Loading";
  errorMessage?: string;
}

export const Main: React.FunctionComponent<MainProps> = (props) => {
  switch (props.type) {
    case "Active":
      return <EditorContainer />;
    case "Error":
      return (
        <React.Fragment>
          <div className="error">{props.errorMessage}</div>
        </React.Fragment>
      );
    case "Loading":
      return (
        <React.Fragment>
          <div>Loading...</div>
        </React.Fragment>
      );
  }
};
