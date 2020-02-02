import { Nutrients } from "./Nutrients";
import { Quantity, canonicalizeQuantity } from "./Quantity";

export interface FoodData {
  description: string;
  nutrientsPerServing: Nutrients;
  // amount and unit of serving equivalent quantities,
  // represented as a dict.
  servingEquivalentQuantities: {
    [index: string]: number;
  };
}

export function makeFoodData(
  description:string,
  nutrientsPerServing: Nutrients,
  servingEquivalentQuantities: Quantity[]) {
  let servingEquivalentQuantitiesDict: {[index: string]: number} = {};
  servingEquivalentQuantities.forEach(quantity => {
    quantity = canonicalizeQuantity(quantity);
    servingEquivalentQuantitiesDict[quantity.unit] = quantity.amount;
  });
  return {
    description: description,
    nutrientsPerServing: nutrientsPerServing,
    servingEquivalentQuantities: servingEquivalentQuantitiesDict,
  };
}
