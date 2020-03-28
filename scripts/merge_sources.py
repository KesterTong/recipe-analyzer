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
"""Functions to merge data files.

This produces an output which is a list of JSON like objects
with the same format as the FoodDataCentral API.
"""
from collections import defaultdict
from datetime import datetime


def _convert_date_format(d):
    """Convert from file format to API format."""
    if not d:
        return None
    dt = datetime.strptime(d, '%Y-%m-%d')
    return '%d/%d/%d' % (dt.month, dt.day, dt.year)


_NEW_UNIT_NAMES = {
    'G': 'g',
    'UG': '\u00b5g',
    'IU': 'IU',
    'kJ': 'kJ',
    'MG_ATE': 'mg_ATE',
    'MG': 'mg',
    'KCAL': 'kcal',
}
_UNKNOWN_UNIT = 'UNKNOWN_UNIT'


def _remove_nones(obj):
    """Return a new object ommitting keys whose value is none."""
    return {key: value for key, value in obj.items() if value is not None}


def _convert_nutrient(nutrient):
    return _remove_nones({
        'id': int(nutrient.id),
        'name': nutrient.name,
        'unitName': _NEW_UNIT_NAMES.get(nutrient.unit_name, _UNKNOWN_UNIT),
        'number': nutrient.nutrient_nbr,
        'rank': int(nutrient.rank) if nutrient.rank else None
    })


def _convert_food_nutrient(food_nutrient, nutrients):
    # In order to ensure that _NEW_UNIT_NAMES covers all nutrients that
    # are used in the Branded Food data, we check here for _UNKNOWN_UNIT
    assert nutrients[food_nutrient.nutrient_id]['unitName'] != _UNKNOWN_UNIT, \
        food_nutrient
    return {
        "type": "FoodNutrient",
        "id": int(food_nutrient.id),
        "nutrient": nutrients[food_nutrient.nutrient_id],
        "amount": float(food_nutrient.amount)
    }


def _merge(branded_food, food, food_nutrients, nutrients):
    assert food.data_type == 'branded_food'
    assert food.fdc_id == branded_food.fdc_id
    assert food.publication_date
    for food_nutrient in food_nutrients:
        assert food_nutrient.fdc_id == branded_food.fdc_id
    return _remove_nones({
        'foodClass': 'Branded',
        'description': food.description,
        'foodNutrients': [
            _convert_food_nutrient(food_nutrient, nutrients)
            for food_nutrient in food_nutrients
            if food_nutrient.nutrient_id in nutrients],
        'tableAliasName': 'branded_food',
        'brandOwner': branded_food.brand_owner,
        'gtinUpc': branded_food.gtin_upc,
        'dataSource': branded_food.data_source,
        'ingredients': branded_food.ingredients,
        'modifiedDate': _convert_date_format(branded_food.modified_date),
        'availableDate': _convert_date_format(branded_food.available_date),
        'servingSize': float(branded_food.serving_size),
        'servingSizeUnit': branded_food.serving_size_unit,
        'householdServingFullText': branded_food.household_serving_fulltext,
        'brandedFoodCategory': branded_food.branded_food_category,
        'fdcId': int(branded_food.fdc_id),
        'dataType': 'Branded',
        'publicationDate': _convert_date_format(food.publication_date),
        'foodPortions': [],
    })


def merge_sources(raw_data):
    """Merge all the sources in raw_data.

    Each field in raw_data represents a single CSV file.  This function
    merges these into a single list, where each element of the list is
    a JSON-like object containing the same data as the output of the
    FoodDataCentral API.

    Args:
        raw_data: A `RawData`.

    Returns:
        A list of JSON-like objects.
    """
    print('merging raw data rows')
    # Convert branded_food_data.foods to dict for merging.
    foods = {food.fdc_id: food for food in raw_data.foods}
    # Convert nutrients to a dict for merging.
    # Skip nutrients with rank '' because it's not clear how to handle them.
    nutrients = {
        nutrient.id: _convert_nutrient(nutrient)
        for nutrient in raw_data.nutrients}

    food_nutrients = defaultdict(list)
    for food_nutrient in raw_data.food_nutrients:
        food_nutrients[food_nutrient.fdc_id].append(food_nutrient)

    result = []
    for branded_food in raw_data.branded_foods:
        fdc_id = branded_food.fdc_id
        result.append(_merge(
            branded_food, foods[fdc_id], food_nutrients[fdc_id], nutrients))

    return result
