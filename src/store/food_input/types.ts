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

export interface State {
  foodId: string | null;
  deselected: boolean;
  // Null means the ingredient is loading so description is not known.
  // This occurs when loading a recipe so its ingredient ids are known
  // and selected but the ingredient foods have not been loaded yet.
  description: string | null;
}

export enum ActionType {
  SELECT = "@food_input/Select",
  DESELECT = "@food_input/Deselect",
}

export interface Select {
  type: ActionType.SELECT;
  foodId: string;
  description: string;
}

export interface Deselect {
  type: ActionType.DESELECT;
}

export type Action = Select | Deselect;
