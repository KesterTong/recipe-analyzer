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
import { Update } from "../core";
import { Editor, StateProps as EditorStateProps } from "./Editor";

export interface MainProps {
  // TODO: use some kind of union type here.
  editorStateProps?: EditorStateProps;
  errorMessage?: string;

  selectRecipe(index: number): void;
  selectIngredient(index: number): void;
  updateDocument(update: Update): void;
}

export const Main: React.FunctionComponent<MainProps> = (props) => {
  if (props.editorStateProps) {
    return (
      <Editor
        {...props.editorStateProps}
        selectRecipe={props.selectRecipe}
        selectIngredient={props.selectIngredient}
        updateDocument={props.updateDocument}
      />
    );
  } else if (props.errorMessage) {
    return (
      <React.Fragment>
        <div className="error">{props.errorMessage}</div>
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <div>Loading...</div>
      </React.Fragment>
    );
  }
};
