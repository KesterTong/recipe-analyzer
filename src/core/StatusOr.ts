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

export enum StatusCode {
  LOADING = "@Status/Loading",
  UNKNOWN_QUANTITY = "@Status/UnknownQuantity",
  // When the amount in the edit UI is not a number.
  NAN_AMOUNT = "@Status/NanAmount",
  // An error happened when processing an ingredient of a recipe.
  INGREDIENT_ERROR = "@Status/IngredientError",
  // A recipe had a title that was not in the table of contents.
  TITLE_NOT_IN_TOC_ERROR = "@Status/IngredientError",
  // Error loading food from FDC
  FDC_API_ERROR = "@Status/FdcApiError",
}

export interface Status {
  code: StatusCode;
  message: string;
}

export function status(code: StatusCode, message: string): Status {
  return { code, message };
}

export function hasCode<T>(status: StatusOr<T>, code: StatusCode): boolean {
  return (status as Status).code === code;
}

export function isError<T>(status: StatusOr<T>): status is Status {
  return (status as Status).code !== undefined;
}

export function isOk<T>(status: StatusOr<T>): status is T {
  return (status as Status).code === undefined;
}

export type StatusOr<T> = Status | T;
