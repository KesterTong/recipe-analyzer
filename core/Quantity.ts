import { FoodData } from "./FoodData";
import { Nutrients, scaleNutrients } from "./Nutrients";

export interface Quantity {
  amount: number;
  unit: string;
}

export function nutrientsForQuantity(quantity: Quantity, foodData: FoodData): Nutrients {
  quantity = canonicalizeQuantity(quantity);
  // The number of units of the quantity per serving.
  let unitsPerServing = foodData.servingEquivalentQuantities[quantity.unit];
  if (unitsPerServing == null) {
      return null;
  }
  var servings = quantity.amount / unitsPerServing;
  return scaleNutrients(foodData.nutrientsPerServing, servings);
}

/**
 * Transform a quantity by
 *  - Converting mass units to 'g' and volume units to 'ml'.
 *  - Removing trailing 's' to alllow plural and singular forms.
 *  - Convert to lowercase.
 */
export function canonicalizeQuantity(quantity: Quantity): Quantity {
  var amount = quantity.amount;
  var unit = quantity.unit.toLowerCase().replace(/(\w*)s$/, '$1');
  const gramEquivalentByUnit: {[index: string]: number} = {
    'oz': 28.35,
    'lb': 453.59,
    'kg': 1000.00,
  };
  const mlEquivalentByUnit: {[index: string]: number} = {
    'fl oz': 29.5735,
    'fl. oz': 29.5735,
    'cup': 236.59,
    'tbsp': 14.79,
    'tablespoon': 14.79,
    'tsp': 4.93,
    'teaspoon': 4.93,
    'pint': 473.17,
    'quart': 946.35,
    'gallon': 3785.41,
  };
 
  if (gramEquivalentByUnit[unit]) {
    return {
      amount: amount * gramEquivalentByUnit[unit],
      unit: 'g',
    };
  }
  if (mlEquivalentByUnit[unit]) {
    return {
      amount: amount * mlEquivalentByUnit[unit],
      unit: 'ml',
    };
  }
  return {amount: amount, unit: unit};
}
