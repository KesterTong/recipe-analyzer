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

import { Database } from "./Database";
import { debounce } from "throttle-debounce";

const wrapServerFunction = (functionName: string) => (...args: any[]) =>
  new Promise<any>((resolve, reject) => {
    (<any>window).google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      [functionName].apply(null, args);
  });

/**
 * An implementation of a Database that stores recipes in a Google Doc.
 */
export const DocsDatabase: Database = {
  parseDocument: wrapServerFunction("parseDocument"),
  updateDocument: wrapServerFunction("updateDocument"),
};
