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
import { FDCFood } from "../core/FDCFood";
import { FDCQueryResult } from "../core/FDCQueryResult";

// Key in ScriptProperties for USDA API key
const USDA_API_KEY_KEY = 'USDA_API_KEY'

/**
 * Adaptor class for calling FoodDataCentral API from Google Apps Script.
 */
export class FdcAdaptor {
  private usdaApiKey: string;

  constructor(
      private urlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp,
      private propertiesService: GoogleAppsScript.Properties.PropertiesService) {
    let usdaApiKey = this.propertiesService.getScriptProperties().getProperty(USDA_API_KEY_KEY);
    if (usdaApiKey == null) {
      throw Error(
        'The script property ' + USDA_API_KEY_KEY + ' was not set.');
    }
    this.usdaApiKey = usdaApiKey;
  }

  static build(): FdcAdaptor {
    return new FdcAdaptor(UrlFetchApp, PropertiesService);
  }

  getFdcFood(fdcId: number): FDCFood {
    let url = this.fdcApiUrl(fdcId.toString(), {});
    // TODO: handle API call failures.
    return JSON.parse(this.urlFetchApp.fetch(url).getContentText());  
  }

  searchFdcFoods(query: string): FDCQueryResult {
    let url = this.fdcApiUrl('search', {
      generalSearchInput: encodeURIComponent(query),
      includeDataTypeList: 'SR%20Legacy,Branded',
    });
    // TODO: handle API call failures.
    return JSON.parse(this.urlFetchApp.fetch(url).getContentText());
  }

  private fdcApiUrl(resource: string, options: {[index: string]: string}): string {
    let url = 'https://api.nal.usda.gov/fdc/v1/' + encodeURIComponent(resource) + '?api_key=' + this.usdaApiKey;
    Object.keys(options).forEach(key => {
      url += '&' + key + '=' + options[key];
    })
    return url;
  }
}