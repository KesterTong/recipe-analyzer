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
import unittest

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
    'dataSource',
    'modifiedDate',
    'availableDate',
    'labelNutrients',
    'changes',
]


class IntegrationTest(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        self.raw_data_dir = kwargs.pop('raw_data_dir')
        self.golden_data_dir = kwargs.pop('golden_data_dir')
        super(IntegrationTest, self).__init__(*args, **kwargs)

    def test_load_and_merge(self):

        raw_data = load_raw_data(self.raw_data_dir)
        merged_data = merge_sources(raw_data)

        with open(os.path.join(self.golden_data_dir, '356425.json')) as f:
            expected = json.load(f)

        expected = _remove_keys(expected, _MISSING_KEYS)

        self.maxDiff = None
        self.assertMultiLineEqual(
            json.dumps(expected, indent=2, sort_keys=True),
            json.dumps(merged_data[0], indent=2, sort_keys=True))
