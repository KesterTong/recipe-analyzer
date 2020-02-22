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

import { Form, Navbar, Container } from 'react-bootstrap';

import { IngredientSearcher } from './IngredientSearcher';
import { IngredientIdentifier } from '../core/FoodRef';
import { IngredientDatabase } from '../core/IngredientDatabase';
import { Food } from '../core/Food';
import { NutrientInfo } from '../core/Nutrients';
import { SRLegacyFood } from '../core/FoodDataCentral';
import { Recipe } from '../core/Recipe';
import { NutrientsViewer, NutrientsViewProps } from './NutrientsViewer';
import { normalizeFood } from '../core/normalizeFood';
import { NormalizedFood } from '../core/NormalizedFood';
import { BrandedFoodViewer } from './BrandedFoodViewer';
import { Action } from './actions';
import { EditButton, EditState } from './EditButton';

function getQuantities(food: Food): {description: string, servings: number}[] {
  switch (food.dataType) {
    case 'Recipe':
      return [{description: '1 serving', servings: 1}];
    case 'Branded':
      return [{
        description: food.householdServingFullText! + ' (' + food.servingSize + ' ' + food.servingSizeUnit + ')',
        servings: food.servingSize / 100
      }, {
        description: '100 ' + food.servingSizeUnit,
        servings: 1,
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

export const RecipeViewer: React.SFC<{food: Recipe, nutrientsViewProps: NutrientsViewProps, nutrientInfos: NutrientInfo[]}> = (props) => {
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
    <NutrientsViewer {...props.nutrientsViewProps} key={food.description} />
  </React.Fragment>;
}

export const SRLegacyFoodViewer: React.SFC<{food: SRLegacyFood, nutrientsViewProps: NutrientsViewProps, nutrientInfos: NutrientInfo[]}> = (props) => {
  let food = props.food;
  // TODO new id instead of description for key.
  return <React.Fragment>
    <h1>{food.description}</h1>
    <h2>Nutrients</h2>
    <NutrientsViewer 
        {...props.nutrientsViewProps}
        key={food.description} />
  </React.Fragment>;
}

interface IngredientBrowserProps {
  nutrientInfos: NutrientInfo[];
  ingredientDatabase: IngredientDatabase;
};

interface NoFoodSelected {
  state: 'NoFoodSelected';
}

interface FoodSelectedWaiting {
  state: 'FoodSelectedWaiting';
  ingredientIdentifier: IngredientIdentifier,
}

interface FoodSelectedNotFound {
  state: 'FoodSelectedNotFound';
  ingredientIdentifier: IngredientIdentifier,
}

interface FoodSelected {
  state: 'FoodSelected';
  ingredientIdentifier: IngredientIdentifier;
  food: Food;
  nutrientsViewProps: NutrientsViewProps;
  editState: EditState;
}

type IngredientBrowserState = NoFoodSelected | FoodSelectedWaiting | FoodSelectedNotFound | FoodSelected;

export class IngredientBrowser extends React.Component<IngredientBrowserProps, IngredientBrowserState> {

  state: IngredientBrowserState = {state: 'NoFoodSelected'};

  render() {
    let contents = null;
    let editState: EditState = {editable: false};

    if (this.state.state == 'FoodSelected') {
      let food = this.state.food;
      let nutrientsViewProps = this.state.nutrientsViewProps;
      editState = this.state.editState;
      let editMode = editState.editable && editState.editMode;
      switch (food.dataType) {
        case 'Branded':
          contents = <BrandedFoodViewer food={food} nutrientsViewProps={nutrientsViewProps} nutrientInfos={this.props.nutrientInfos} editMode={editMode} dispatch={this._dispatch}/>
          break;
        case 'SR Legacy':
          contents = <SRLegacyFoodViewer food={food} nutrientsViewProps={nutrientsViewProps} nutrientInfos={this.props.nutrientInfos}/>
          break;
        case 'Recipe':
          contents = <RecipeViewer food={food} nutrientsViewProps={nutrientsViewProps} nutrientInfos={this.props.nutrientInfos}/>
          break;
      }
    }
    return <React.Fragment>
      <Navbar bg="light" expand="lg">
        <Form inline>
          <IngredientSearcher dispatch={this._dispatch} ingredientDatabase={this.props.ingredientDatabase}/>
          <EditButton editState={editState} dispatch={this._dispatch}/>
        </Form>
      </Navbar>
      <Container>
        { contents }
      </Container>
    </React.Fragment>;
  }

  _dispatch = (action: Action) => {
    switch (action.actionType) {
      case 'ToggleEditMode':
        this._toggleEditMode()
        break;
      case 'SelectFood':
        this._handleSelection(action.ingredientIdentifier);
        break;
      case 'UpdateDescription':
        if (this.state.state == 'FoodSelected' && this.state.food.dataType == 'Branded') {
          this.setState({...this.state, food: {...this.state.food, description: action.description}});
        }
        break;
      case 'UpdateServingSize':
        if (this.state.state == 'FoodSelected' && this.state.food.dataType == 'Branded') {
          this.setState({...this.state, food: {...this.state.food, servingSize: action.servingSize}});
        }
        break;
      case 'UpdateServingSizeUnit':
        if (this.state.state == 'FoodSelected' && this.state.food.dataType == 'Branded') {
          this.setState({...this.state, food: {...this.state.food, servingSizeUnit: action.servingSizeUnit}});
        }
        break;
      case 'UpdateHouseholdUnit':
        if (this.state.state == 'FoodSelected'&& this.state.food.dataType == 'Branded') {
          this.setState({...this.state, food: {...this.state.food, householdServingFullText: action.householdUnit}});
        }
        break;
      case 'UpdateNutrientValue':
        if (this.state.state == 'FoodSelected' && this.state.food.dataType == 'Branded') {
          let foodNutrients = this.state.food.foodNutrients.map(nutrient =>
            nutrient.nutrient.id == action.nutrientId ? {...nutrient, amount: action.value} : nutrient);
          this.setState({...this.state, food: {...this.state.food, foodNutrients}});
        }
        break;
    }
  }

  _toggleEditMode = () => {
    if (this.state.state != 'FoodSelected') {
      return;
    }
    if (!this.state.editState.editable) {
      return;
    }
    if (this.state.editState.editMode) {
      this.props.ingredientDatabase.patchFood(this.state.ingredientIdentifier!, this.state.food!);
    }
    this.setState({state: 'FoodSelected', editState: {editable: true, editMode: !this.state.editState.editMode}});
  }

  _handleSelection = (ingredientIdentifier: IngredientIdentifier | null) => {
    if (ingredientIdentifier == null) {
      this.setState({state: 'NoFoodSelected'});
      return;
    }
    this.props.ingredientDatabase.getFood(ingredientIdentifier).then(food => {
      if (food == null) {
        this.setState({state: 'FoodSelectedNotFound'});
        return;
      }
      normalizeFood(food, this.props.ingredientDatabase).then(normalizedFood =>
        this.setState({
          state: 'FoodSelected',
          ingredientIdentifier,
          food,
          nutrientsViewProps: {
            nutrientsPerServing: normalizedFood.nutrientsPerServing,
            nutrientInfos: this.props.nutrientInfos,
            quantities: getQuantities(food),
          },
          editState: ingredientIdentifier.identifierType == 'BookmarkId' ? {editable: true, editMode: false} : {editable: false},
        }));
    });
  }
}