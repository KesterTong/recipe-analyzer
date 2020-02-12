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
 * Interface for Firebase API
 * 
 * We use this instead of the standard Firebase JS API, because
 * in Apps Script we make calls to the Firebase REST API directly.
 */
export interface Firebase {
  
  /**
   * Get a document or return null if it does not exist.
   * 
   * @param documentName Name of document relative to database, i.e. starting
   *     with 'documents/'.
   */
  getDocument(documentPath: string): Document | null;
  
  /**
   * Insert or update a document.
   * 
   * @param documentName Name of document relative to database, i.e. starting
   *     with 'documents/'.
   * @param document The document to patch.
   */
  patchDocument(documentPath: string, document: Document): void;

  /**
   * List documents in a collection
   * @param collection Concatenation of parent and collectionId. 
   */
  listDocuments(collectionId: string): ListDocumentsResponse | null;
}