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

import { Recipe, Update, UpdateType } from "../core";

const wrapServerFunction = (functionName: string) => (...args: any[]) =>
  new Promise<any>((resolve, reject) => {
    (<any>window).google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      [functionName].apply(null, args);
  });

/**
 * Functions to call the server (Google Apps Script code) to read/write
 * data from the Google Doc.
 */

export function parseDocument(): Promise<Recipe[]> {
  return wrapServerFunction("parseDocument")();
}

export function rawUpdateDocument(update: Update): Promise<void> {
  return wrapServerFunction("updateDocument")(update);
}

class PendingUpdate {
  pendingUpdate: Update | null;
  timeoutHandle: number | null;
  timeoutCallback: () => void;
  complete: Promise<void>;

  constructor(update: Update, previousUpdate: PendingUpdate | null) {
    this.pendingUpdate = update === undefined ? null : update;
    // For typechecking
    this.timeoutHandle = null;
    this.timeoutCallback = () => {};
    // Set initial debounce timeout
    const debounced = new Promise<void>((resolve) => {
      this.timeoutCallback = resolve;
      this.resetDebounceTimer();
    });
    const run = async () => {
      if (previousUpdate !== null) {
        await previousUpdate.complete;
      }
      await debounced;
      // Dispatch the update, and then mark this.pendingUpdate as null
      // since now the update has been sent.  This ensures we won't try
      // to merge a new update with an already-sent one.
      const updateFnComplete = rawUpdateDocument(this.pendingUpdate!);
      this.pendingUpdate = null;
      await updateFnComplete;
    };
    this.complete = run();
  }

  resetDebounceTimer() {
    if (this.timeoutHandle !== null) {
      window.clearTimeout(this.timeoutHandle);
    }
    this.timeoutHandle = window.setTimeout(this.timeoutCallback, 500);
  }

  maybeMergeUpdate(update: Update): boolean {
    if (
      update.type != UpdateType.UPDATE_INGREDIENT ||
      !this.pendingUpdate ||
      this.pendingUpdate.type != UpdateType.UPDATE_INGREDIENT ||
      this.pendingUpdate.recipeIndex != update.recipeIndex ||
      this.pendingUpdate.ingredientIndex != update.ingredientIndex
    ) {
      return false;
    }

    this.pendingUpdate = {
      ...this.pendingUpdate,
      ...update,
    };
    // reset timeout
    this.resetDebounceTimer();
    return true;
  }
}

let lastPendingUpdate: PendingUpdate | null = null;

// Debouncing for updates to Google Doc.
//
// Currently just waits until the last update has finished.
export function updateDocument(update: Update): Promise<void> {
  if (lastPendingUpdate && lastPendingUpdate.maybeMergeUpdate(update)) {
    // If possible, merge with pending update.
    return lastPendingUpdate.complete;
  }
  // Otherwise schedule a new update after the pending update.
  lastPendingUpdate = new PendingUpdate(update, lastPendingUpdate);
  return lastPendingUpdate.complete;
}
