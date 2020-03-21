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
import { State, Action, ActionType, initialState } from "./types";

export function reducer(state: State=initialState, action: Action): State {
  switch(action.type) {
    case ActionType.DESELECT:
      return {...state, deselected: true};
    case ActionType.SELECT:
      return {foodId: action.foodId, description: action.description, deselected: false};
    case ActionType.UPDATE_DESCRIPTION:
      return {...state, description: action.description};
  }
}