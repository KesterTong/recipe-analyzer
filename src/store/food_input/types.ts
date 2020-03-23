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
import { FoodRef } from "../../../core/FoodRef";

export interface State {
  foodRef: FoodRef | null;
  deselected: boolean;
}

export const initialState: State = {
  foodRef: null,
  deselected: false,
};

export enum ActionType {
  DESELECT = "@food_input/Deselect",
  SELECT = "@food_input/Select",
  UPDATE_DESCRIPTION = "@food_input/UpdateDescription",
}

export interface Deselect {
  type: ActionType.DESELECT;
}

export interface Select {
  type: ActionType.SELECT;
  foodRef: FoodRef;
}

export interface UpdateDescription {
  type: ActionType.UPDATE_DESCRIPTION;
  description: string;
}

export type Action = Deselect | Select | UpdateDescription;
