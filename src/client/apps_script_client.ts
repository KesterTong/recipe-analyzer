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
import { Config } from "../config/config";

/**
 * Functions provided by AppsScript code.
 */
export interface AppsScriptFunctions {
  parseDocument(): Recipe[];
  updateDocument(update: Update): void;
  selectRecipe(recipeIndex: number): void;
  getConfig(): Config;
}

export const appsScriptFunctionsKeys: (keyof AppsScriptFunctions)[] = [
  "parseDocument",
  "updateDocument",
  "selectRecipe",
  "getConfig",
];

type Promisify<T> = T extends (...args: infer ArgTys) => infer RetTy
  ? (...args: ArgTys) => Promise<RetTy>
  : never;

export type ClientFunctions<T> = {
  [P in keyof T]: Promisify<T[P]>;
};

function wrapServerFunction<T>(
  functionName: string | number | symbol
): Promisify<T> {
  return ((...args: any[]) =>
    new Promise<any>((resolve, reject) => {
      (<any>window).google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        [functionName].apply(null, args);
    })) as Promisify<T>;
}

function wrapServerFunctions<T>(keys: (keyof T)[]): ClientFunctions<T> {
  const result = {} as ClientFunctions<T>;
  keys.forEach((key) => {
    result[key] = wrapServerFunction(key);
  });
  return result;
}

/**
 * Functions to call the server (Google Apps Script code) to read/write
 * data from the Google Doc.
 */
const clientFunctions: ClientFunctions<AppsScriptFunctions> = wrapServerFunctions(
  appsScriptFunctionsKeys
);

export const parseDocument = clientFunctions.parseDocument;
export const selectRecipe = clientFunctions.selectRecipe;
export const getConfig = clientFunctions.getConfig;

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
      const updateFnComplete = clientFunctions.updateDocument(
        this.pendingUpdate!
      );
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
