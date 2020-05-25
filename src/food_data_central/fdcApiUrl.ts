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

export function fdcApiUrl(
  resource: string,
  fdcApiKey: string,
  options: {
    [index: string]: string;
  }
): string {
  let url =
    "https://api.nal.usda.gov/fdc/v1/" +
    encodeURIComponent(resource) +
    "?api_key=" +
    fdcApiKey;
  Object.keys(options).forEach((key) => {
    url += "&" + key + "=" + options[key];
  });
  return url;
}
