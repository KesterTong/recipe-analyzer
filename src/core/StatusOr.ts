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

export interface Status {
  code: string;
  message?: string;
}

export function error(code: string, message?: string): Status {
  return {code, message};
}

export function isOk<T>(status: StatusOr<T>): status is T {
  return (status as Status).code === undefined;
}

export type StatusOr<T> = Status | T;
