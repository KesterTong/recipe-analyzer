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

export class IngredientsTableRowAdaptor {
  constructor (private row: GoogleAppsScript.Document.TableRow, private documentAdaptor: DocumentAdaptor) {}

  bookmarkId(): string | null {
    return this.documentAdaptor.bookmarkIdForElement(this.row.getCell(0));
  }

  description(): string {
    return this.row.getCell(0).getText();
  }

  householdServingStr(): string {
    return this.row.getCell(1).getText();
  }

  nutrientValues(): number[] {
    let result: number[] = [];
    let numCells = this.row.getNumCells();
    for (let cellIndex = 2; cellIndex < numCells; cellIndex++) {
      result.push(Number(this.row.getCell(cellIndex).getText()));
    }
    return result;
  }
}

export class IngredientsTableAdaptor {
  constructor (private table: GoogleAppsScript.Document.Table, private documentAdaptor: DocumentAdaptor) {}

  nutrientNames(): string[] | null {
    if (this.table.getNumRows() < 1) {
      return null;
    }
    let headerRow = this.table.getRow(0);
    let numCells = headerRow.getNumCells();
    if (numCells <= 2) {
      return null;
    }
    let result: string[] = [];
    for (let cellIndex = 2; cellIndex < numCells; cellIndex++) {
      result.push(headerRow.getCell(cellIndex).getText());
    }
    return result;
  }

  // Return adaptors for non-header Rows.
  ingredientRows(): IngredientsTableRowAdaptor[] {
    let numRows = this.table.getNumRows();
    let result: IngredientsTableRowAdaptor[] = [];
    for (let rowIndex = 1; rowIndex < numRows; rowIndex++) {
      let row = this.table.getRow(rowIndex);
      if (row.getNumCells() < 2) {
        continue;
      }
      result.push(new IngredientsTableRowAdaptor(this.table.getRow(rowIndex), this.documentAdaptor));
    }
    return result;
  }
}

/**
 * Adaptor class for Apps Script Document class.
 */
export class DocumentAdaptor {
  private bookmarkIdByText : {[index: string]: string} = {};

  constructor(private document: GoogleAppsScript.Document.Document) {
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
  
  /**
   * Returns the table of custom ingredients in this doc.
   */
  getCustomIngredientsTable(): IngredientsTableAdaptor | null {
    let tables = this.document.getBody().getTables();
    if (tables.length == 0) {
      return null;
    }
    return new IngredientsTableAdaptor(tables[tables.length - 1], this);
  }

  /**
   * Looks up the bookmark of an element if there is one.
   * 
   * @param element An Element.
   */
  bookmarkIdForElement(element: GoogleAppsScript.Document.Element): string | null {
    let text = getText(element);
    if (text == null) {
      return null;
    }
    return this.bookmarkIdByText[text] || null;
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
function getText(element: GoogleAppsScript.Document.Element): string | null {
  switch (element.getType()) {
    case DocumentApp.ElementType.PARAGRAPH:
      return element.asParagraph().getText();
    case DocumentApp.ElementType.TABLE_CELL:
      return element.asTableCell().getText();
    default:
      return null;
  }
}
