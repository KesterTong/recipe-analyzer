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
"""Convert USDA Branded Foods database to Open Food Facts format.

The Branded Foods database is available at
https://fdc.nal.usda.gov/download-datasets.html
"""
import json
import os
import re
import unittest
import urllib.request

from .load_raw_data import load_raw_data
from .merge_sources import merge_sources


def _remove_keys(obj, keys_to_remove):
    """Remove the given fields from a JSON-like object.

    Traverses `obj` and removes the given keys at any nesting depth.

    Examples:

    _strip_keys({'a': [{'a': 0, 'b': 1}], 'b': 2}, ['a']) ==
    {'b': 2}

    _strip_keys({'a': [{'a': 0, 'b': 1}], 'b': 2}, ['b']) ==
    {'a': [{'a': 0}]}

    Args:
        obj: A JSON-like object
        keys_to_remove: A list of keys

    Returns:
        A copy of `obj` with the given fields removed at any nesting depth.
    """
    if isinstance(obj, list):
        return [_remove_keys(item, keys_to_remove) for item in obj]
    elif isinstance(obj, dict):
        return {
            key: _remove_keys(value, keys_to_remove)
            for key, value in obj.items() if key not in keys_to_remove}
    else:
        return obj


# Keys that are missing from the output data.
_MISSING_KEYS = [
    'foodNutrientDerivation',
    'foodComponents',
    'foodAttributes',
    'labelNutrients',
    'foodUpdateLog',
    'changes',
]

# Sample of FDC ids used for testing.  This is a random sample from
# `branded_foods.csv`.
_FDC_IDS = [
    '350008',
    '355499',
    '356004',
    '356143',
    '368211',
    '377358',
    '378073',
    '379530',
    '390247',
    '400772',
    '401400',
    '403073',
    '403707',
    '404010',
    '405454',
    '405490',
    '407733',
    '408548',
    '415941',
    '416928',
    '417385',
    '419867',
    '425979',
    '428099',
    '428810',
    '429357',
    '431749',
    '435310',
    '436836',
    '436838',
    '440954',
    '443635',
    '444425',
    '451838',
    '452383',
    '452887',
    '454049',
    '454292',
    '455817',
    '458742',
    '473904',
    '475058',
    '477287',
    '481683',
    '487112',
    '487357',
    '488197',
    '488746',
    '490212',
    '495472',
    '506922',
    '523469',
    '524035',
    '528907',
    '529131',
    '531077',
    '533496',
    '539723',
    '539785',
    '544132',
    '544194',
    '544326',
    '544461',
    '558457',
    '561264',
    '561443',
    '562685',
    '569582',
    '572402',
    '573102',
    '583497',
    '583990',
    '590358',
    '592132',
    '601251',
    '611568',
    '617574',
    '624342',
    '626648',
    '628488',
    '633140',
    '641166',
    '648994',
    '652792',
    '654712',
    '676082',
    '678652',
    '680804',
    '681044',
    '689570',
    '702728',
    '707010',
    '711796',
    '723568',
    '723728',
    '724314',
    '728054',
    '730120',
    '738648',
    '741658',
    # These ensure full coverage for all nutrient units.
    '356425',
    '356544',
    '370154',
]

# URL for FoodDataCentral API.
_FDC_API_URL = 'https://api.nal.usda.gov/fdc/v1/'


def create_test_data(raw_data_dir, fdc_api_key, test_data_dir):
    # Construct a regex like '"123"|"456"'.  Using the quotes helps to
    # avoid matchig a row where the fdc_id is a substring of another id,
    # which can happen.
    filter_regex = re.compile('|'.join('"%s"' % id for id in _FDC_IDS))

    def copy_and_filter(filename, filter):
        """Copy and CSV file and optinally filter."""
        print('Creating test data file: %s' % filename)
        input_filename = os.path.join(raw_data_dir, filename)
        output_filename = os.path.join(test_data_dir, filename)
        with open(input_filename) as fin:
            with open(output_filename, 'w') as fout:
                line = fin.readline()
                fout.write(line)
                while True:
                    line = fin.readline()
                    if not line:
                        break
                    if filter and not filter_regex.search(line):
                        continue
                    fout.write(line)
    copy_and_filter('branded_food.csv', True)
    copy_and_filter('food_nutrient.csv', True)
    copy_and_filter('food_attribute.csv', True)
    copy_and_filter('food_update_log_entry.csv', True)
    copy_and_filter('food.csv', True)
    copy_and_filter('nutrient.csv', False)

    for fdc_id in _FDC_IDS:
        print('Downloading golden data for fdc_id: %s' % fdc_id)
        # Typically we should escape URL params but here we know they
        # don't need escaping.
        url = _FDC_API_URL + fdc_id + '?API_KEY=' + fdc_api_key
        # NOTE: if you get an error message containing
        # CERTIFICATE_VERIFY_FAILED and are using OSX,
        # see https://stackoverflow.com/a/42334357.
        response = urllib.request.urlopen(url)
        filename = os.path.join(test_data_dir, fdc_id + '.json')
        with open(filename, 'w') as f:
            f.write(response.read().decode('utf8'))


class IntegrationTest(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        self.test_data_dir = kwargs.pop('test_data_dir')
        super(IntegrationTest, self).__init__(*args, **kwargs)

    def test_load_and_merge(self):
        raw_data = load_raw_data(self.test_data_dir)
        merged_data = merge_sources(raw_data)
        merged_data = {str(item['fdcId']): item for item in merged_data}

        for fdc_id in _FDC_IDS:
            print('validating food with fdc_id: %s' % fdc_id)
            actual = merged_data[fdc_id]

            filename = os.path.join(self.test_data_dir, fdc_id + '.json')
            with open(filename) as f:
                expected = json.load(f)

            expected = _remove_keys(expected, _MISSING_KEYS)

            self.maxDiff = None
            self.assertMultiLineEqual(
                json.dumps(expected, indent=2, sort_keys=True),
                json.dumps(actual, indent=2, sort_keys=True))
