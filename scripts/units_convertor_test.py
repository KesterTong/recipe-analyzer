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
"""Unit tests for units_convertor module."""
import unittest

from .units_convertor import UnitsConvertor


class UnitsConvertorTest(unittest.TestCase):
    def setUp(self):
        self.units_convertor = UnitsConvertor([
            UnitsConvertor.UnitDefinition('g', 1.0, 'g'),
            UnitsConvertor.UnitDefinition('kg', 1000.0, 'g'),
            UnitsConvertor.UnitDefinition('lb', 454.0, 'g'),
            UnitsConvertor.UnitDefinition('ml', 1.0, 'ml'),
            UnitsConvertor.UnitDefinition('L', 1000.0, 'ml'),
            UnitsConvertor.UnitDefinition('cup', 237.0, 'ml'),
        ])

    def test_convert_quantity_to_unit_kg_to_lb(self):
        self.assertAlmostEqual(
            self.units_convertor.convert_quantity_to_unit(2, 'kg', 'lb'),
            2 * 1000.0 / 454.0)

    def test_convert_quantity_to_unit_kg_to_g(self):
        self.assertAlmostEqual(
            self.units_convertor.convert_quantity_to_unit(2, 'kg', 'g'),
            2000.0)

    def test_convert_quantity_to_unit_different_types(self):
        with self.assertRaisesRegex(ValueError,
                                    'Cannot convert between units lb and cup'):
            self.units_convertor.convert_quantity_to_unit(2, 'lb', 'cup')

    def test_convert_quantity_to_unit_unknown_unit(self):
        with self.assertRaisesRegex(ValueError, 'Unknown unit furlong'):
            self.units_convertor.convert_quantity_to_unit(2, 'furlong', 'cup')

    def test_convert_quantity_to_unit_unknown_new_unit(self):
        with self.assertRaisesRegex(ValueError, 'Unknown unit second'):
            self.units_convertor.convert_quantity_to_unit(2, 'L', 'second')


if __name__ == '__main__':
    unittest.main()
