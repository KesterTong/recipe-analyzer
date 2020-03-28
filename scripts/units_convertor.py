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
"""Class to perform unit conversions."""
from collections import namedtuple


class UnitsConvertor(object):
    """Class to perform unit converions.

    Args:
        unit_definitions: A list of `UnitDefinition`s.
    """
    def __init__(self, equivalences):
        # Re-express unit_definitions as a dict.
        self.unit_definitions = {}
        for unit, base_unit_amount, base_unit in equivalences:
            if unit in self.unit_definitions:
                raise ValueError('Unit %s was defined twice' % unit)
            self.unit_definitions[unit] = (base_unit_amount, base_unit)

    def convert_quantity_to_unit(self, amount, unit, new_unit):
        """Convert a quantity to a new unit.

        Returns:
            The equivalent amount of the new unit.
        """
        base_unit_amount, base_unit = self._lookup_unit(unit)
        new_base_unit_amount, new_base_unit = self._lookup_unit(new_unit)
        if base_unit != new_base_unit:
            raise ValueError(
                'Cannot convert between units %s and %s' % (unit, new_unit))
        # Using equations with units, we have
        #
        # unit = base_unit_amount * base_unit, and
        # new_unit = new_base_unit_amount * base_unit.
        #
        # E.g. if unit = kg and new_unit = lb, we have
        #
        # kg = 1000 * g and
        # lb = 454 * g
        #
        # Dividing by base_unit_amount and new_base_unit_amount
        # respectivley, gives the equations
        #
        # unit / base_unit_amount = base_unit = new_unit / new_base_unit_amount
        #
        # e.g.
        #
        # kg / 1000 = g = lb / 454
        #
        # Rearranging this gives
        #
        # amount * unit =
        # amount * (base_unit_amount / new_base_unit_amount) * new_unit
        #
        # e.g. if amount = 3 then
        #
        # 3 * kg = 3 * (1000 / 454) * lb
        return amount * float(base_unit_amount) / float(new_base_unit_amount)

    def _lookup_unit(self, unit):
        try:
            return self.unit_definitions[unit]
        except KeyError:
            raise ValueError('Unknown unit %s' % unit)

    # Defines a unit, e.g. UnitDefinition('kg', 1000, 'g')
    UnitDefinition = namedtuple(
        'UnitDefinition',
        ['unit', 'base_unit_amount', 'base_unit'])
