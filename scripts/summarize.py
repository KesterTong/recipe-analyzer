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
from collections import Counter
from contextlib import contextmanager
import csv
import os

from .load_raw_data import load_raw_data
from .merge_sources import merge_sources


def write_values_and_frequencies(merged_data, field, csv_writer):
    print('generating values and frequencies for field: %s' % field)
    categories = Counter(
        item[field] for item in merged_data)
    csv_writer.writerow([field, 'frequency'])
    for value, frequency in categories.most_common():
        csv_writer.writerow([value, str(frequency)])


def summarize(raw_data_dir, summary_dir):
    raw_data = load_raw_data(raw_data_dir)
    merged_data = merge_sources(raw_data)

    # Use a generator for this helper function so we can use it in
    # a `with` statement.
    @contextmanager
    def summary_writer(filename):
        with open(os.path.join(summary_dir, filename), 'w', newline='') as f:
            yield csv.writer(f,  quoting=csv.QUOTE_ALL)

    with summary_writer('category.csv') as csv_writer:
        write_values_and_frequencies(
            merged_data, 'brandedFoodCategory', csv_writer)

    with summary_writer('data_source.csv') as csv_writer:
        write_values_and_frequencies(
            merged_data, 'dataSource', csv_writer)
