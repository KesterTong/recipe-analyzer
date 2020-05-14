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
import { FakeDatabase } from "./FakeDatabase";
import { Provider } from "react-redux";
import { store, initialize } from "../src/store";
import { MainContainer } from "../src/MainContainer";
import { fetchFdcFoods } from "../src/document/fetchFdcFoods";

ReactDOM.render(
  <Provider store={store}>
    <div style={{ width: "300px" }}>
      <MainContainer database={FakeDatabase} />
    </div>
  </Provider>,
  document.getElementById("root")
);

async function init() {
  const document = await FakeDatabase.parseDocument();
  const fdcFoodsById = await fetchFdcFoods(document);
  store.dispatch(initialize(document, fdcFoodsById));
}

init();
