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

import { Document } from './Document';
import { Food } from "../core/Food";

export function documentToFood(document: Document): Food | null {
  let version = document.fields.version;
  if (version == null || version.stringValue == null || version.stringValue != '0.1') {
    return null;
  }
  let data = document.fields.data;
  if (data == null || data.stringValue == null) {
    return null;
  }
  return JSON.parse(data.stringValue);
}