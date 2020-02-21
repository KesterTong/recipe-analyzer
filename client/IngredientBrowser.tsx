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

import { Card, ListGroup, Form, Table, Navbar, Container } from 'react-bootstrap';

import { IngredientSearcher } from './IngredientSearcher';
import { IngredientIdentifier } from '../core/FoodRef';
import { IngredientDatabase } from '../core/IngredientDatabase';
import { Food } from '../core/Food';
import { NutrientInfo } from '../core/Nutrients';
import { SRLegacyFood, BrandedFood } from '../core/FoodDataCentral';
import { Recipe } from '../core/Recipe';
import { NutrientsViewer } from './NutrientsViewer';
import { normalizeFood } from '../core/normalizeFood';
import { NormalizedFood } from '../core/NormalizedFood';


export const RecipeViewer: React.SFC<{food: Recipe, normalizedFood: NormalizedFood, nutrientInfos: NutrientInfo[]}> = (props) => {
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
    <NutrientsViewer
        food={food}
        normalizedFood={props.normalizedFood}
        nutrientInfos={props.nutrientInfos}
        key={food.description} />
  </React.Fragment>;
}

export const BrandedFoodViewer: React.SFC<{food: BrandedFood, normalizedFood: NormalizedFood, nutrientInfos: NutrientInfo[]}> = (props) => {
  let food = props.food;
  return <React.Fragment>
    <h1>{food.description} <em>{food.brandOwner ? '(' + food.brandOwner + ')' : ''}</em></h1>
    { food.ingredients ? <React.Fragment><h2>Ingredients</h2>{food.ingredients}</React.Fragment> : null }
    <h2>Nutrients</h2>
    <NutrientsViewer 
        food={food}
        normalizedFood={props.normalizedFood}
        nutrientInfos={props.nutrientInfos}
        key={food.description} />
  </React.Fragment>;
}

export const SRLegacyFoodViewer: React.SFC<{food: SRLegacyFood, normalizedFood: NormalizedFood, nutrientInfos: NutrientInfo[]}> = (props) => {
  let food = props.food;
  // TODO new id instead of description for key.
  return <React.Fragment>
    <h1>{food.description}</h1>
    <h2>Nutrients</h2>
    <NutrientsViewer 
        food={food}
        normalizedFood={props.normalizedFood}
        nutrientInfos={props.nutrientInfos}
        key={food.description} />
  </React.Fragment>;
}

interface IngredientBrowserProps {
  nutrientInfos: NutrientInfo[];
  ingredientDatabase: IngredientDatabase;
};

interface IngredientBrowserState {
  food: Food | null;
  normalizedFood: NormalizedFood | null;
};

export class IngredientBrowser extends React.Component<IngredientBrowserProps, IngredientBrowserState> {

  state: IngredientBrowserState = {food: null, normalizedFood: null};

  render() {
    let food = this.state.food;
    let normalizedFood = this.state.normalizedFood;
    let contents = null;
    if (food != null && normalizedFood != null) {
      switch (food.dataType) {
        case 'Branded':
          contents = <BrandedFoodViewer food={food} normalizedFood={normalizedFood} nutrientInfos={this.props.nutrientInfos}/>
          break;
        case 'SR Legacy':
          contents = <SRLegacyFoodViewer food={food} normalizedFood={normalizedFood} nutrientInfos={this.props.nutrientInfos}/>
          break;
        case 'Recipe':
          contents = <RecipeViewer food={food} normalizedFood={normalizedFood} nutrientInfos={this.props.nutrientInfos}/>
          break;
      }
    }
    return <React.Fragment>
      <Navbar bg="light" expand="lg">
        <Form inline><IngredientSearcher onChange={this._handleSelection} ingredientDatabase={this.props.ingredientDatabase}/></Form>
      </Navbar>
      <Container>
        { contents }
      </Container>
    </React.Fragment>;
  }

  _handleSelection = (selected: IngredientIdentifier | null) => {
    if (selected) {
      this.props.ingredientDatabase.getFood(selected).then(food => {
        if (food == null) {
          this.setState({food: null, normalizedFood: null});
        } else {
          normalizeFood(food, this.props.ingredientDatabase).then(normalizedFood => {
            this.setState({food, normalizedFood})
          })
        }
      });
    }
  }
}