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
from .load_raw_data import load_raw_data
from .merge_sources import merge_sources


def summarize(raw_data_dir):
    raw_data = load_raw_data(raw_data_dir)
    merged_data = merge_sources(raw_data)
    print('generating categories')
    categories = sorted(set(
        item['brandedFoodCategory'] for item in merged_data))
    print(categories)
