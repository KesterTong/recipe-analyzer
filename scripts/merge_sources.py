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


def _convert_date_format(publication_date):
    """Convert from file format to API format."""
    dt = datetime.strptime(publication_date, '%Y-%m-%d')
    return '%d/%d/%d' % (dt.month, dt.day, dt.year)


def _convert_unit(unit):
    if unit == 'IU':
        return 'IU'
    else:
        return unit.lower()


def _convert_nutrient(nutrient):
    return {
        'id': int(nutrient.id),
        'name': nutrient.name,
        'unitName': _convert_unit(nutrient.unit_name),
        'rank': int(nutrient.rank),
        'number': nutrient.nutrient_nbr
    }


def _convert_food_nutrient(food_nutrient, nutrients):
    return {
        "type": "FoodNutrient",
        "id": int(food_nutrient.id),
        "nutrient": nutrients[food_nutrient.nutrient_id],
        "amount": float(food_nutrient.amount)
    }


def _merge(branded_food, food, food_nutrients, nutrients):
    assert food.data_type == 'branded_food'
    assert food.fdc_id == branded_food.fdc_id
    for food_nutrient in food_nutrients:
        assert food_nutrient.fdc_id == branded_food.fdc_id
    return {
        'foodClass': 'Branded',
        'description': food.description,
        'foodNutrients': [
            _convert_food_nutrient(food_nutrient, nutrients)
            for food_nutrient in food_nutrients
            if food_nutrient.nutrient_id in nutrients],
        'tableAliasName': 'branded_food',
        'brandOwner': branded_food.brand_owner,
        'gtinUpc': branded_food.gtin_upc,
        'ingredients': branded_food.ingredients,
        'servingSize': float(branded_food.serving_size),
        'servingSizeUnit': branded_food.serving_size_unit,
        'householdServingFullText': branded_food.household_serving_fulltext,
        'brandedFoodCategory': branded_food.branded_food_category,
        'fdcId': int(branded_food.fdc_id),
        'dataType': 'Branded',
        'publicationDate': _convert_date_format(food.publication_date),
        'foodPortions': [],
    }


def merge_sources(raw_data):
    """Merge all the sources in branded_food_data."""
    # Convert branded_food_data.foods to dict for merging.
    foods = {food.fdc_id: food for food in raw_data.foods}
    # Convert nutrients to a dict for merging.
    # Skip nutrients with rank '' because it's not clear how to handle them.
    nutrients = {
        nutrient.id: _convert_nutrient(nutrient)
        for nutrient in raw_data.nutrients
        if nutrient.rank != ''}

    food_nutrients = defaultdict(list)
    for food_nutrient in raw_data.food_nutrients:
        food_nutrients[food_nutrient.fdc_id].append(food_nutrient)

    result = []
    for branded_food in raw_data.branded_foods:
        fdc_id = branded_food.fdc_id
        result.append(_merge(
            branded_food, foods[fdc_id], food_nutrients[fdc_id], nutrients))

    return result
