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
"""Functions to export merged data to CSV format."""
from collections import namedtuple
import csv
import os

from .load_raw_data import load_raw_data
from .merge_sources import merge_sources
from .units_convertor import UnitsConvertor


# A mapping from JSON format to a column
FieldColumn = namedtuple(
    'FieldColumn',
    ['field', 'name', 'value_mapping'])


# A mapping from a nutrient value to a column.  It is assumed that
# each output column represents the quantity of the nutrient for
# 100 g or 100 ml.
NutrientColumn = namedtuple(
    'NutrientColumn',
    ['nutrient_name', 'name', 'unit'])


COLUMNS = [
    FieldColumn('gtinUpc', 'code', None),
    FieldColumn('description', 'product_name', None),
    FieldColumn('householdServingFullText', 'quantity', None),
    FieldColumn('brandedFoodCategory', 'categories', None),
    FieldColumn('ingredients', 'ingredients_text', None),
    # NOTE: docs say "serving size in g" but data might be in ml.
    FieldColumn('servingSize', 'serving_size', None),
    NutrientColumn('Energy', 'energy_100g', 'kJ'),
    NutrientColumn('Protein', 'proteins_100g', 'g'),
]

_UNITS_CONVERTOR = UnitsConvertor([
    UnitsConvertor.UnitDefinition('kJ', 1.0, 'kJ'),
    UnitsConvertor.UnitDefinition('kcal', 4.184, 'kJ'),
    UnitsConvertor.UnitDefinition('g', 1.0, 'g'),
    UnitsConvertor.UnitDefinition('mg', 0.001, 'g'),
    UnitsConvertor.UnitDefinition('IU', 0.00067, 'g'),
])


def _extract_column_value(column, item, nutrients_by_name):
    if isinstance(column, FieldColumn):
        return item[column.field]
    elif isinstance(column, NutrientColumn):
        try:
            nutrient = nutrients_by_name[column.nutrient_name]
        except KeyError:
            return ''
        
        amount = _UNITS_CONVERTOR.convert_quantity_to_unit(
            nutrient['amount'],
            nutrient['nutrient']['unitName'],
            column.unit)
        return str(amount)
    else:
        assert False, 'bad type for column'


def _export(merged_data, columns, csv_writer):
    """Export merged data to CSV format.

    Args:
        merged_data: A list of dictionaries of JSON format data.
        column_mappings: A list of `ColumnMapping`s.  Columns will be written
            in this order.
    """
    print('writing merged data to CSV file')
    csv_writer.writerow(column.name for column in columns)
    for item in merged_data:
        nutrients_by_name = {
            nutrient['nutrient']['name']: nutrient
            for nutrient in item['foodNutrients']}
        csv_writer.writerow(
            _extract_column_value(column, item, nutrients_by_name)
            for column in columns)


def export_csv(raw_data_dir, merged_data_dir):
    raw_data = load_raw_data(raw_data_dir)
    merged_data = merge_sources(raw_data)
    merged_data_csv_file = os.path.join(merged_data_dir, 'merged.csv')
    with open(merged_data_csv_file, 'w', newline='') as f:
        csv_writer = csv.writer(f,  quoting=csv.QUOTE_ALL)
        _export(merged_data, COLUMNS, csv_writer)
