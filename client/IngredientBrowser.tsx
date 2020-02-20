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



interface IngredientBrowserState {
  food: Food | null,
};

export class IngredientBrowser extends React.Component<{nutrientInfos: NutrientInfo[]}, IngredientBrowserState> {

  state: IngredientBrowserState = {food: null};

  render() {
    let food = this.state.food;
    let items = [];
    if (food != null) {
      if (food.dataType == 'Branded') {
        if (food.ingredients) {
          items.push(<React.Fragment><h2>Ingredients</h2>{food.ingredients}</React.Fragment>);
        }
      } else if (food.dataType == 'Recipe') {
        let ingredients = food.ingredientsList.map(ingredient => {
          return <li>{ingredient.quantity.amount.toString()} {ingredient.quantity.unit} {ingredient.foodLink.description}</li>;
        });
        items.push(<React.Fragment><h2>Ingredients</h2><ul>{ingredients}</ul></React.Fragment>);
      }
    }
    return <React.Fragment>
      <Navbar bg="light" expand="lg">
        <Form inline><IngredientSearcher onChange={this._handleSelection}/></Form>
      </Navbar>
      <Container>
      {food ? <h1>{food.description} {food.dataType == 'Branded' && food.brandOwner ? <em>({food.brandOwner})</em> : null } </h1> : null}
      {items}
      {food ? <React.Fragment>
        <h2>Nutrients</h2>
          <NutrientsView 
          food={food}
          nutrientInfos={this.props.nutrientInfos}
          key={food.description} // TODO: us food id
          />
          </React.Fragment> : null }
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