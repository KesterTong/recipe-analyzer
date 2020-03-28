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
import argparse
import json
import os
import pathlib

from .load_raw_data import load_raw_data
from .merge_sources import merge_sources


def _assert_subobject(subobj, obj, path=None):
    if isinstance(subobj, list):
        assert isinstance(obj, list)
        assert len(subobj) == len(obj)
        for index, (subobj_item, obj_item) in enumerate(zip(subobj, obj)):
            _assert_subobject(
                subobj_item,
                obj_item,
                str(index) if path is None else path + '.' + str(index))
    elif isinstance(subobj, dict):
        assert isinstance(obj, dict)
        for key, value in subobj.items():
            _assert_subobject(
                value,
                obj[key],
                key if path is None else path + '.' + key)
    else:
        assert subobj == obj, (path, subobj, obj)


if __name__ == '__main__':
    testdata_dir = os.path.join(pathlib.Path(__file__).absolute().parent, 'testdata')
    fdc_data_dir = os.path.join(testdata_dir, 'fdc_data')

    raw_data = load_raw_data(fdc_data_dir)
    merged_data = merge_sources(raw_data)

    with open(os.path.join(testdata_dir, '356425.json')) as f:
        expected = json.load(f)
        _assert_subobject(merged_data[0], expected)