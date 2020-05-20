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

export interface Unit {
  // The value of the unit in g or ml.
  value: number;
  // The primary name of the unit.
  name: string;
  // Othr names of the unit.
  otherNames: string[];
}

/**
 * Configuration for the app.
 *
 * This currently doesn't distinguish between script-level, user-level
 * and document-level config.
 */
export interface Config {
  nutrients: {
    id: number;
    name: string;
  }[];
  massUnits: Unit[];
  volumeUnits: Unit[];
}

export const defaultConfig: Config = {
  nutrients: [
    {
      id: 1008,
      name: "Energy (kcal)",
    },
    {
      id: 1003,
      name: "Protein (g)",
    },
  ],
  massUnits: [
    {
      value: 1,
      name: "g",
      otherNames: ["gram", "grams"],
    },
    {
      value: 28.35,
      name: "oz",
      otherNames: ["onz", "ounce", "ounces"],
    },
    {
      value: 453.58,
      name: "lb",
      otherNames: ["lbs", "pound", "pounds"],
    },
    {
      value: 1000,
      name: "kg",
      otherNames: ["kilo", "kilos", "kilogram", "kilograms"],
    },
  ],
  volumeUnits: [
    {
      value: 1,
      name: "ml",
      otherNames: ["milliliter", "milliliters"],
    },
    {
      value: 29.5735,
      name: "fl oz",
      otherNames: ["fl. oz"],
    },
    {
      value: 236.59,
      name: "cup",
      otherNames: ["cups"],
    },
    {
      value: 14.79,
      name: "tbsp",
      otherNames: ["tablespoon", "tablespoons"],
    },
    {
      value: 4.93,
      name: "tsp",
      otherNames: ["teaspoon", "teaspoons"],
    },
    {
      value: 473.17,
      name: "pint",
      otherNames: ["pt", "pints"],
    },
    {
      value: 946.35,
      name: "quart",
      otherNames: ["qt", "quarts"],
    },
    {
      value: 3785.41,
      name: "gallon",
      otherNames: ["gallons"],
    },
    {
      value: 1000,
      name: "L",
      otherNames: ["liter", "liters"],
    },
  ],
};
