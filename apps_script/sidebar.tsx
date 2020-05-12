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

import ReactDOM = require("react-dom");
import React = require("react");
import { DocsDatabase } from "./DocsDatabase";
import { Provider } from "react-redux";
import { store, updateDocument } from "../src/store";
import { MainContainer } from "../src/MainContainer";

ReactDOM.render(
  <Provider store={store}>
    <MainContainer database={DocsDatabase} />
  </Provider>,
  document.getElementById("root")
);

DocsDatabase.parseDocument().then((document) =>
  store.dispatch(updateDocument(document))
);
