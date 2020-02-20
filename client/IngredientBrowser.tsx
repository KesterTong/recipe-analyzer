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

import { Card, ListGroup, Form, Table } from 'react-bootstrap';

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
  selectedQuantity: number,
  quantities: {description: string, servings: number}[],
  onChange: (event: React.FormEvent) => void,
  nutrientInfos: NutrientInfo[],
}

const NutrientsView: React.SFC<NutrientsViewProps> = (props) => {
  let nutrients = [1008, 1003];
  let normalized = normalizeFood(props.food, nutrients)!;
  return (
    <React.Fragment>
      <Form.Control as="select" value={props.quantities[props.selectedQuantity].description} onChange={props.onChange}>
        { props.quantities.map(quantity => <option>{quantity.description}</option>) }
      </Form.Control>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nutrient</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {
          props.nutrientInfos.map(nutrientInfo => (
            <tr>
            <td>{nutrientInfo.name}</td>
            <td>{normalized.nutrientsPerServing[nutrientInfo.id] * props.quantities[props.selectedQuantity].servings}</td>
            </tr>
          ))
          }
        </tbody>
      </Table>
    </React.Fragment>
  );
}

interface IngredientBrowserState {
  food: Food | null,
  selectedQuantity: number,
  quantities: {description: string, servings: number}[],
}

export class IngredientBrowser extends React.Component<{nutrientInfos: NutrientInfo[]}, IngredientBrowserState> {

  state: IngredientBrowserState = {food: null, selectedQuantity: 0, quantities: []};

  render() {
    let food = this.state.food;
    let items = [
      <ListGroup.Item><IngredientSearcher onChange={this._handleSelection}/></ListGroup.Item>,
    ];
    if (food != null) {
      items.push(<ListGroup.Item><p><b>Description:</b> {food.description}</p></ListGroup.Item>);
      if (food.dataType == 'Branded') {
        if (food.brandOwner) {
          items.push(<ListGroup.Item><p><b>Brand:</b> {food.brandOwner}</p></ListGroup.Item>);
        }
        if (food.ingredients) {
          items.push(<ListGroup.Item><p><b>Ingredients:</b> {food.ingredients}</p></ListGroup.Item>);
        }
      } else if (food.dataType == 'Recipe') {
        let ingredients = food.ingredientsList.map(ingredient => {
          return <li>{ingredient.quantity.amount.toString()} {ingredient.quantity.unit} {ingredient.foodLink.description}</li>;
        });
        items.push(<ListGroup.Item><p><b>Ingredients:</b></p><ul>{ingredients}</ul></ListGroup.Item>);
      }
      items.push(
        <ListGroup.Item>
          <NutrientsView 
          food={food}
          selectedQuantity={this.state.selectedQuantity}
          quantities={this.state.quantities}
          onChange={this._handleQuantityChange}
          nutrientInfos={this.props.nutrientInfos}
          />
        </ListGroup.Item>);
    }
    return (
      <Card>
        <ListGroup variant="flush">
          {items}
        </ListGroup>
      </Card>
    );
  }

  _handleQuantityChange = (event: React.FormEvent) => {
    if (event.target instanceof HTMLSelectElement) {
      let value = event.target.value;
      this.state.quantities.forEach((quantity, index) => {
        if (quantity.description == value) {
          this.setState({selectedQuantity: index})
        }
      })
    }
  }

  _handleSelection = (selected: IngredientIdentifier | null) => {
    if (selected) {
      getIngredientDatabase().getFood(selected).then(food => {
        this.setState({
          food,
          quantities: food ? getQuantities(food): [],
          selectedQuantity: 0,
        });
      })
    }
  }
  
}