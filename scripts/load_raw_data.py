# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Functions to load data from Branded Food data download."""
import csv
import os

from .file_schemas import BrandedFood
from .file_schemas import Food
from .file_schemas import FoodAttribute
from .file_schemas import FoodNutrient
from .file_schemas import FoodUpdateLogEntry
from .file_schemas import Nutrient
from .file_schemas import RawData


def _load_data_file(data_dir, filename, data_cls):
    """Load a data file, returning a list of dicts.

    Loads a data file in the USDA FDC data dump format.  Each
    file contains a header row, which is used to convert every
    other row into a dict.  This function returns a list of dicts,
    representing the rows of the file.

    Args:
        data_dir: The directory containing USDA data.
        data_cls: The namedtuple for this data file.

    Returns:
        A list of dicts, whose keys are the column names.
    """
    print('loading file %s' % filename)
    with open(os.path.join(data_dir, filename)) as f:
        reader = csv.reader(f)
        header_row = next(reader)
        # Verify the header rows match the fields
        assert header_row == list(data_cls._fields)
        # For each row after the header row, convert from a
        # list to an instance of data_cls.
        return list(map(data_cls._make, reader))


def load_raw_data(data_dir):
    return RawData(
        branded_foods=_load_data_file(
            data_dir, 'branded_food.csv', BrandedFood),
        food_nutrients=_load_data_file(
            data_dir, 'food_nutrient.csv', FoodNutrient),
        food_attributes=_load_data_file(
            data_dir, 'food_attribute.csv', FoodAttribute),
        food_update_log_entries=_load_data_file(
            data_dir, 'food_update_log_entry.csv', FoodUpdateLogEntry),
        foods=_load_data_file(
            data_dir, 'food.csv', Food),
        nutrients=_load_data_file(
            data_dir, 'nutrient.csv', Nutrient))
