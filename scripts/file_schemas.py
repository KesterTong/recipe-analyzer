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
"""Schemas for files in Branded Food data download.

These are just `namedtuple`s based on the column header names.
"""
import collections


BrandedFood = collections.namedtuple(
    'BrandedFood',
    [
        'fdc_id',
        'brand_owner',
        'gtin_upc',
        'ingredients',
        'serving_size',
        'serving_size_unit',
        'household_serving_fulltext',
        'branded_food_category',
        'data_source',
        'modified_date',
        'available_date'
    ])


FoodNutrient = collections.namedtuple(
    'FoodNutrient',
    [
        'id',
        'fdc_id',
        'nutrient_id',
        'amount',
        'data_points',
        'derivation_id',
        'min',
        'max',
        'median',
        'footnote',
        'min_year_acquired'
    ])


FoodAttribute = collections.namedtuple(
    'FoodAttribute',
    [
        'id',
        'fdc_id',
        'seq_num',
        'food_attribute_type_id',
        'name',
        'value'
    ])


FoodUpdateLogEntry = collections.namedtuple(
    'FoodUpdateLogEntry',
    ['id', 'description', 'last_updated'])


Food = collections.namedtuple(
    'Food',
    [
        'fdc_id',
        'data_type',
        'description',
        'food_category_id',
        'publication_date'
    ])


Nutrient = collections.namedtuple(
    'Nutrient',
    [
        'id',
        'name',
        'unit_name',
        'nutrient_nbr',
        'rank'
    ])


# The data from all files.  Each field is a list whose values are namedtuples
# of the type for that file.
RawData = collections.namedtuple(
    'RawData',
    [
        'branded_foods',
        'food_nutrients',
        'food_attributes',
        'food_update_log_entries',
        'foods',
        'nutrients',
    ])
