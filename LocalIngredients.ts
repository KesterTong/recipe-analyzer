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

import { FoodData } from './nutrients';

export class LocalIngredients {
  private bookmarkIdByText : {[index: string]: string} = {};
  private foodDataByBookmarkId: {[index: string]: FoodData} = {};

  constructor(document: GoogleAppsScript.Document.Document) {
    this.parseBookmarks(document);
  }

  private parseBookmarks(document: GoogleAppsScript.Document.Document) {
    document.getBookmarks().forEach(bookmark => {
      let text = getText(bookmark.getPosition().getElement());
      if (text != null) {
        this.bookmarkIdByText[text] = bookmark.getId();
      }
    });
  }

  getFoodData(fdcId: string): FoodData {
    return this.foodDataByBookmarkId[fdcId];
  }

  insertFoodData(fdcId: string, foodData: FoodData) {
    this.foodDataByBookmarkId[fdcId] = foodData;
  }

  /**
   * Looks up the bookmark of an element if there is one.
   * 
   * @param element An Element.
   */
  bookmarkIdForElement(element: GoogleAppsScript.Document.Element): string {
    return this.bookmarkIdByText[getText(element)];
  }

}

/**
 * Get the text of an element.
 * 
 * This method is convenient as sometimes there are a few levels of the document
 * tree that have the same value of getText() and so we don't have to be precise
 * about what element we have.  For example, a typical table cell looks like
 * TableCell -> Paragraph -> Text.
 * 
 * The bookmark will usually point to the Paragraph but when traversing the table
 * we can just use the TableCell.
 * 
 * @param element An element
 * @requires The text that the element contains.
 */
function getText(element: GoogleAppsScript.Document.Element): string {
  switch (element.getType()) {
    case DocumentApp.ElementType.PARAGRAPH:
      return element.asParagraph().getText();
    case DocumentApp.ElementType.TABLE_CELL:
      return element.asTableCell().getText();
    default:
      return null;
  }
}
