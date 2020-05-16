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

type UdpateFn =  (update: Update) => Promise<void>;

// Debouncing for updates to Google Doc.
//
// Currently just waits until the last update has finished.
export function debounce(updateFn: UdpateFn): UdpateFn {
  // The head of the queue of pending updates.
  let lastPendingUpdate: Promise<void> | null = null;
  return function(update) {
    if (lastPendingUpdate == null) {
      lastPendingUpdate = updateFn(update);
    } else {
      lastPendingUpdate = lastPendingUpdate.then(() => {
        return updateFn(update);
      });
    }
    return lastPendingUpdate;
  }
}