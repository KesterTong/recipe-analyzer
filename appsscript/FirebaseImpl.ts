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

// Base URL for firebase API
const FIRESTORE_API_URL = 'https://firestore.googleapis.com/v1';

// Key in ScriptProperties for Firebase project name
const FIREBASE_PROJECT_NAME_KEY = 'FIREBASE_PROJECT_NAME';

// Database used for all collections (we assume default database is used).
const DATABASE_NAME = '(default)';

export interface ArrayValue {
  values: Value[];
}

export interface Value {
  nullValue?: null,
  booleanValue?: boolean,
  integerValue?: string,
  doubleValue?: number,
  timestampValue?: string,
  stringValue?: string,
  bytesValue?: string,
  referenceValue?: string,
  arrayValue?: ArrayValue,
}

export interface Document {
  name?: string,
  fields: {[index: string]: Value},
  createTime?: string,
  updateTime?: string
}

export interface ListDocumentsResponse {
  documents: Document[],
  nextPageToken: string,
}

/**
 * Adaptor class for calling Firebase from Google Apps Script.
 */
export class FirebaseImpl {
  private projectName: string;

  constructor(
      private urlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp,
      private scriptApp: GoogleAppsScript.Script.ScriptApp,
      propertiesService: GoogleAppsScript.Properties.PropertiesService) {
    let projectName = propertiesService.getScriptProperties().getProperty(
      FIREBASE_PROJECT_NAME_KEY);
    if (projectName == null) {
      throw Error(
        'The script property ' + FIREBASE_PROJECT_NAME_KEY + ' was not set.');
    }
    this.projectName = projectName;
  }

  static build(): FirebaseImpl {
    return new FirebaseImpl(UrlFetchApp, ScriptApp, PropertiesService);
  }

  /**
   * Get a document or return null if it does not exist.
   * 
   * @param documentName Name of document relative to database, i.e. starting
   *     with 'documents/'.
   */
  getDocument(documentPath: string): Document | null {
    let response = this.urlFetchApp.fetch(this.urlForDocument(documentPath), {
      method: "get",
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer " + this.scriptApp.getOAuthToken()
      },
      muteHttpExceptions: true,
    });
    if (response.getResponseCode() == 404) {
      return null;
    }
    return JSON.parse(response.getContentText());
  }
  
  /**
   * Insert or update a document.
   * 
   * @param documentName Name of document relative to database, i.e. starting
   *     with 'documents/'.
   * @param document The document to patch.
   */
  patchDocument(documentPath: string, document: Document) {
    this.urlFetchApp.fetch(this.urlForDocument(documentPath), {
      method: "patch",
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer " + this.scriptApp.getOAuthToken()
      },
      payload: JSON.stringify(document),
    });
  }

  /**
   * List documents in a collection
   * @param collection Concatenation of parent and collectionId. 
   */
  listDocuments(collectionId: string): ListDocumentsResponse | null {
    let response = this.urlFetchApp.fetch(this.urlForDocument(collectionId), {
      method: "get",
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer " + this.scriptApp.getOAuthToken()
      },
      muteHttpExceptions: true,
    });
    if (response.getResponseCode() == 404) {
      return null;
    }
    return JSON.parse(response.getContentText());
  }

  private urlForDocument(documentPath: string): string {
    return FIRESTORE_API_URL + '/projects/' + this.projectName + '/databases/' + DATABASE_NAME + '/documents/' + documentPath;
  }
}