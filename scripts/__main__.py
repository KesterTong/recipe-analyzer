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
"""Utilities for importing the USDA Branded Foods database.

The Branded Foods database is available at
https://fdc.nal.usda.gov/download-datasets.html

This utility current loads the data and tests the correctness of
the library.
"""
import os
import pathlib

from .integration_test import IntegrationTest


if __name__ == '__main__':
    testdata_dir = os.path.join(
        pathlib.Path(__file__).absolute().parent, 'testdata')
    raw_data_dir = os.path.join(testdata_dir, 'fdc_data')
    test_case = IntegrationTest(
        raw_data_dir=raw_data_dir,
        golden_data_dir=testdata_dir)
    test_case.test_load_and_merge()
