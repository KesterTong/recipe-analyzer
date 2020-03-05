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
import * as React from 'react';

import { NutrientInfo } from '../core/Nutrients';
import { Recipe } from '../core/Recipe';
import { connect } from 'react-redux';
import { RootState } from './RootState';

interface RecipeViewerProps {
  food: Recipe,
  nutrientInfos: NutrientInfo[],
}

const RecipeViewerView: React.SFC<RecipeViewerProps> = (props) => {
  let food = props.food;
  return <React.Fragment>
    <h1>{food.description}</h1>
    <h2>Ingredients</h2>
    <ul>
      {
        food.ingredientsList.map(ingredient =>
          <li>{ingredient.quantity.amount.toString()} {ingredient.quantity.unit} {ingredient.ingredientIdentifier.identifierType}</li>
        )
      }
    </ul>
    <h2>Nutrients</h2>
  </React.Fragment>;
}

function mapStateToProps(state: RootState) {
  return {
    food: state.food as Recipe,
    nutrientInfos: state.nutrientInfos || [],
  }
}

export const RecipeViewer = connect(mapStateToProps)(RecipeViewerView);