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

import { Update } from "../apps_script/Database";

type UpdateFn =  (update: Update) => Promise<void>;

// No updated has yet been dispatched
interface InitialState {
  type: "InitialState";
}

// The most recent update has already been dispatched (and
// possibly completed).
interface DispatchedState {
  type: "Dispatched";
  completed: Promise<void>;
}

type State = InitialState | DispatchedState;

// Debouncing for updates to Google Doc.
//
// Currently just waits until the last update has finished.
export function debounce(updateFn: UpdateFn): UpdateFn {
  // The head of the queue of pending updates.  If not null,
  // this is either a promise which 
  let state: State = {type: "InitialState"};
  return function(update) {
    switch (state.type) {
      case "InitialState":
        state = {
          type: "Dispatched",
          completed: updateFn(update),
        };
        return state.completed;
      case "Dispatched":
        state = {
          type: "Dispatched",
          completed: state.completed.then(() => updateFn(update)),
        }
        return state.completed
    }
  }
}