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
import argparse

from .export_csv import export_csv
from .integration_test import create_test_data
from .integration_test import IntegrationTest
from .summarize import summarize


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Utilities for importing the USDA Branded Foods database',
        usage="""scripts <command> [<args>]

        Available commands:
            summarize               print summary information
            export_csv              export raw data to merged CSV format
            create_test_data        create data for integration tests
            test                    run integration tests

        Args for summarize:
            --raw_data_dir          directory containing raw FDC data
            --summary_dir           directory to write summmary data to

        Args for export_csv
            --raw_data_dir          directory containing raw FDC data
            --export_config_file    file containing export config
            --merged_data_dir       directory to write merged CSV data to

        Args for create_test_data:
            --raw_data_dir          directory containing raw FDC data
            --fdc_api_key           API key to call FDC API
            --test_data_dir         directory to write test data to

        Args for test:
            --test_data_dir         directory containing test data
        """)
    parser.add_argument('command', help='the command to run')
    parser.add_argument(
        '--raw_data_dir',
        help='directory containing raw FDC data')
    parser.add_argument(
        '--summary_dir',
        help='directory to write summary data to')
    parser.add_argument(
        '--export_config_file',
        help='file containing export config')
    parser.add_argument(
        '--merged_data_dir',
        help='directory to write merged CSV data to')
    parser.add_argument(
        '--fdc_api_key',
        help='API key to call FDC API')
    parser.add_argument(
        '--test_data_dir',
        help='directory containing test data')
    args = parser.parse_args()
    if args.command == 'summarize':
        summarize(
            raw_data_dir=args.raw_data_dir,
            summary_dir=args.summary_dir)
    elif args.command == 'export_csv':
        export_csv(
            raw_data_dir=args.raw_data_dir,
            export_config_file=args.export_config_file,
            merged_data_dir=args.merged_data_dir)
    elif args.command == 'test':
        test_case = IntegrationTest(test_data_dir=args.test_data_dir)
        test_case.test_load_and_merge()
    elif args.command == 'create_test_data':
        create_test_data(
            raw_data_dir=args.raw_data_dir,
            fdc_api_key=args.fdc_api_key,
            test_data_dir=args.test_data_dir)
    else:
        raise ValueError("Unknown command %s" % args.command)
