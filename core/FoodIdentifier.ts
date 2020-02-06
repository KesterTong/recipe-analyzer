export interface FDCFoodIdentifier {
  foodType: 'FDC Food',
  fdcId: number,
}

export interface LocalFoodIdentifier {
  foodType: 'Local Food',
  bookmarkId: string,
}

export type FoodIdentifier = FDCFoodIdentifier | LocalFoodIdentifier;
