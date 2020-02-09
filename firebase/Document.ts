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

export interface ArrayValue {
  values: Value[];
}

export interface Value {
  nullValue?: null,
  booleanValue?: boolean,
  integerValue?: string,
  doubleValue?: number,
  timestampValue?: string,
  stringValue?: string,
  bytesValue?: string,
  referenceValue?: string,
  arrayValue?: ArrayValue,
}

export interface Document {
  name?: string,
  fields: {[index: string]: Value},
  createTime?: string,
  updateTime?: string
}

export interface ListDocumentsResponse {
  documents: Document[],
  nextPageToken: string,
}