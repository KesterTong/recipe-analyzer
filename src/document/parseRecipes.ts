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
import { Document } from "./Document";
import { Status, StatusCode } from "../core";

/**
 * Parse the document, generating a set of Recipes.
 * 
 * @param document The document to parse
 * @returns The parsed document and errors
 */
export function parseRecipes(document: Document) {
  const recipeIndexByUrl: { [index: string]: number } = {};
  const errors: Status[] = [];

  // Construct map from recipe titles to the heading URL.
  // Note this can only be done indirectly using to table of
  // contents as heading URLs are not available from the
  // Apps Script API.
  const headingUrlByTitle: { [index: string]: string } = {};
  document.toc.forEach((tocEntry) => {
    headingUrlByTitle[tocEntry.title] = tocEntry.url;
  });

  document.recipes.forEach((recipe, index) => {
    // TODO: parse recipe.

    const recipeUrl = headingUrlByTitle[recipe.title];
    if (recipeUrl === undefined) {
      errors.push({
        code: StatusCode.TITLE_NOT_IN_TOC_ERROR,
        message:
          'Title "' +
          recipe.title +
          '" not found in table of contents.  The table of contents may need refreshing.',
      });
    }
    recipeIndexByUrl[recipeUrl] = index;
  });

  return { recipeIndexByUrl, errors };
}
