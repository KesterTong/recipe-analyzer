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
import { getIngredientDatabase } from './IngredientDatabase';
import { Food } from '../core/Food';
import { normalizeFood } from '../core/normalizeFood';
import { NutrientInfo } from '../core/Nutrients';
import { SRLegacyFood, BrandedFood } from '../core/FoodDataCentral';
import { Recipe } from '../core/Recipe';

function getQuantities(food: Food): {description: string, servings: number}[] {
  switch (food.dataType) {
    case 'Recipe':
      return [{description: '1 serving', servings: 1}];
    case 'Branded':
      return [{
        description: '100 ' + food.servingSizeUnit,
        servings: 1,
      }, {
        description: food.householdServingFullText!,
        servings: food.servingSize / 100
      }];
    case 'SR Legacy':
      let result = [{description: '100 g', servings: 1}];
      food.foodPortions.forEach(portion => {
        let description = portion.amount.toString() + ' ' + portion.modifier + ' (' + portion.gramWeight + ' g)';
        result.push({description, servings: portion.gramWeight / 100});
      });
      return result;
  }
}

interface NutrientsViewProps {
  food: Food,
  nutrientInfos: NutrientInfo[],
}

class NutrientsView extends React.Component<NutrientsViewProps, {selectedQuantity: number}>{
  state = {selectedQuantity: 0};
  
  render () {
    let nutrients = [1008, 1003];
    let normalized = normalizeFood(this.props.food, nutrients)!;
    let quantities = getQuantities(this.props.food);
    let scale = quantities[this.state.selectedQuantity].servings;
    return (
      <React.Fragment>
        <Form.Control as="select" value={quantities[this.state.selectedQuantity].description} onChange={this._handleQuantityChange}>
          { quantities.map(quantity => <option>{quantity.description}</option>) }
        </Form.Control>
        <p>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nutrient</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {
            this.props.nutrientInfos.map(nutrientInfo => (
              <tr>
              <td>{nutrientInfo.name}</td>
              <td>{normalized.nutrientsPerServing[nutrientInfo.id] * scale}</td>
              </tr>
            ))
            }
          </tbody>
        </Table>
        </p>
      </React.Fragment>
    );
  }


  _handleQuantityChange = (event: React.FormEvent) => {
    if (event.target instanceof HTMLSelectElement) {
      let value = event.target.value;
      getQuantities(this.props.food).forEach((quantity, index) => {
        if (quantity.description == value) {
          this.setState({selectedQuantity: index})
        }
      })
    }
  }
}

export const RecipeViewer: React.SFC<{food: Recipe, nutrientInfos: NutrientInfo[]}> = (props) => {
  let food = props.food;
  return <React.Fragment>
    <h1>{food.description}</h1>
    <h2>Ingredients</h2>
    <ul>
      {
        food.ingredientsList.map(ingredient =>
          <li>{ingredient.quantity.amount.toString()} {ingredient.quantity.unit} {ingredient.foodLink.description}</li>
        )
      }
    </ul>
    <h2>Nutrients</h2>
    <NutrientsView 
        food={food}
        nutrientInfos={props.nutrientInfos}
        key={food.description} />
  </React.Fragment>;
}

export const BrandedFoodViewer: React.SFC<{food: BrandedFood, nutrientInfos: NutrientInfo[]}> = (props) => {
  let food = props.food;
  return <React.Fragment>
    <h1>{food.description} <em>{food.brandOwner ? '(' + food.brandOwner + ')' : ''}</em></h1>
    { food.ingredients ? <React.Fragment><h2>Ingredients</h2>{food.ingredients}</React.Fragment> : null }
    <h2>Nutrients</h2>
    <NutrientsView 
        food={food}
        nutrientInfos={props.nutrientInfos}
        key={food.description} />
  </React.Fragment>;
}

export const SRLegacyFoodViewer: React.SFC<{food: SRLegacyFood, nutrientInfos: NutrientInfo[]}> = (props) => {
  let food = props.food;
  // TODO new id instead of description for key.
  return <React.Fragment>
    <h1>{food.description}</h1>
    <h2>Nutrients</h2>
    <NutrientsView 
        food={food}
        nutrientInfos={props.nutrientInfos}
        key={food.description} />
  </React.Fragment>;
}


interface IngredientBrowserState {
  food: Food | null,
};

export class IngredientBrowser extends React.Component<{nutrientInfos: NutrientInfo[]}, IngredientBrowserState> {

  state: IngredientBrowserState = {food: null};

  render() {
    let food = this.state.food;
    let contents = null;
    if (food != null) {
      switch (food.dataType) {
        case 'Branded':
          contents = <BrandedFoodViewer food={food} nutrientInfos={this.props.nutrientInfos}/>
          break;
        case 'SR Legacy':
          contents = <SRLegacyFoodViewer food={food} nutrientInfos={this.props.nutrientInfos}/>
          break;
        case 'Recipe':
          contents = <RecipeViewer food={food} nutrientInfos={this.props.nutrientInfos}/>
          break;
      }
    }
    return <React.Fragment>
      <Navbar bg="light" expand="lg">
        <Form inline><IngredientSearcher onChange={this._handleSelection}/></Form>
      </Navbar>
      <Container>
        { contents }
      </Container>
    </React.Fragment>;
  }

  _handleSelection = (selected: IngredientIdentifier | null) => {
    if (selected) {
      getIngredientDatabase().getFood(selected).then(food =>
        this.setState({food}))
    }
  }
}