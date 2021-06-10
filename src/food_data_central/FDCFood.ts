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

export interface BrandedFood {
  dataType: "Branded";
  description: string;
  servingSize: number;
  servingSizeUnit: string;
  householdServingFullText?: string;
  foodNutrients: {
    nutrient: {
      id: number;
    };
    amount?: number;
  }[];
  ingredients?: string;
  brandOwner?: string;
}

export interface SrLegacyFood {
  dataType: "SR Legacy";
  description: string;
  foodNutrients: {
    nutrient: {
      id: number;
    };
    amount?: number;
  }[];
  foodPortions: {
    modifier: string;
    gramWeight: number;
    amount: number;
  }[];
}

export type FdcFood = BrandedFood | SrLegacyFood;
