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
import json
import os

from .load_raw_data import load_raw_data
from .merge_sources import merge_sources


# A mapping from JSON format to a column
FieldColumn = namedtuple('FieldColumn', ['name', 'field'])


# A mapping from a nutrient value to a column.  Nutrients with
# matching id will be added to this column with amount (in
# the units for that nutrient id) scaled by `scale`.
NutrientColumn = namedtuple(
    'NutrientColumn',
    ['name', 'nutrient_id', 'scale'])

ExportConfig = namedtuple('ExportConfig', ['columns'])


def _column_config_from_json(obj):
    if 'field' in obj:
        return FieldColumn(**obj)
    else:
        return NutrientColumn(**obj)


def _export_config_from_json(obj):
    return ExportConfig(
        columns=list(map(_column_config_from_json, obj['columns'])))


def _extract_column_value(column, item, nutrients_by_id):
    if isinstance(column, FieldColumn):
        return item[column.field]
    elif isinstance(column, NutrientColumn):
        try:
            return str(nutrients_by_id[column.nutrient_id] * column.scale)
        except KeyError:
            return ''
    else:
        assert False, 'bad type for column'


def _export(merged_data, export_config, csv_writer):
    """Export merged data to CSV format.

    Args:
        merged_data: A list of dictionaries of JSON format data.
        column_mappings: A list of `ColumnMapping`s.  Columns will be written
            in this order.
    """
    print('writing merged data to CSV file')
    columns = export_config.columns
    csv_writer.writerow(column.name for column in columns)
    for item in merged_data:
        nutrients_by_name = {
            nutrient['nutrient']['id']: nutrient['amount']
            for nutrient in item['foodNutrients']}
        csv_writer.writerow(
            _extract_column_value(column, item, nutrients_by_name)
            for column in columns)


def export_csv(raw_data_dir, export_config_file, merged_data_dir):
    with open(export_config_file) as f:
        export_config = _export_config_from_json(json.load(f))
    raw_data = load_raw_data(raw_data_dir)
    merged_data = merge_sources(raw_data)
    merged_data_csv_file = os.path.join(merged_data_dir, 'merged.csv')
    with open(merged_data_csv_file, 'w', newline='') as f:
        csv_writer = csv.writer(f,  quoting=csv.QUOTE_ALL)
        _export(merged_data, export_config, csv_writer)
