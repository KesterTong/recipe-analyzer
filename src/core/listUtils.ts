// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Compute the new index of an item after moving another item.
 *
 * Computes the new index of an item, after moving antoher item from
 * movedItemInitialIndex to movedItemFinalIndex.
 *
 * @param index
 * @param movedItemInitialIndex
 * @param movedItemFinalIndex
 */
export function newIndexAfterMove(
  index: number,
  movedItemInitialIndex: number,
  movedItemFinalIndex: number
) {
  if (index == movedItemInitialIndex) {
    // Case 1: This is the ingredient being moved.
    return movedItemFinalIndex;
  } else if (index <= movedItemFinalIndex && index > movedItemInitialIndex) {
    // Case 2: The ingredient is being moved down (increasing its index) and this
    // ingredient is being moved up one (decrementing index) to make room.
    return index - 1;
  } else if (index >= movedItemFinalIndex && index < movedItemInitialIndex) {
    // Case 3: The ingredient is being moved up (decreasing its index) and this
    // ingredient is being moved odwn on (incrementing index) to make room.
    return index + 1;
  } else {
    // Case 4: This ingredient is above or below the ingredients that change place.
    return index;
  }
}

export function moveItems<T>(
  items: T[],
  movedItemInitialIndex: number,
  movedItemFinalIndex: number
): T[] {
  return items.map((_, index) => {
    // The index that the current index should be copied from.
    let previousIndex: number;
    if (index == movedItemFinalIndex) {
      // Case 1: This is the ingredient being moved.
      previousIndex = movedItemInitialIndex;
    } else if (index < movedItemFinalIndex && index >= movedItemInitialIndex) {
      // Case 2: The ingredient is being moved down (increasing its index) and this
      // ingredient is being moved up one (decrementing index) to make room.
      previousIndex = index + 1;
    } else if (index > movedItemFinalIndex && index <= movedItemInitialIndex) {
      // Case 3: The ingredient is being moved up (decreasing its index) and this
      // ingredient is being moved odwn on (incrementing index) to make room.
      previousIndex = index - 1;
    } else {
      // Case 4: This ingredient is above or below the ingredients that change place.
      previousIndex = index;
    }
    return items[previousIndex];
  });
}
