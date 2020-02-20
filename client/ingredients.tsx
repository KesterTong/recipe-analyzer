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

import * as $ from 'jquery';
import Button from 'react-bootstrap/Button';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import { IngredientIdentifier } from '../core/FoodRef';
import { NormalizedFood } from '../core/NormalizedFood';
import { getIngredientDatabase } from './IngredientDatabase';
import { Food } from '../core/Food';
import { normalizeFood } from '../core/normalizeFood';
import { addDetailsTab } from './custom_ingredient';
import { NutrientInfo } from '../core/Nutrients';


class IngredientSearcher extends React.Component<{onChange: (foodIdentifier: IngredientIdentifier | null) => void}> {
  state = {
    isLoading: false,
    options: [],
  };

  render() {
    return (
      <React.Fragment>
        <AsyncTypeahead
          {...this.state}
          filterBy={x => true}
          onChange={this._handleChange}
          minLength={3}
          onSearch={this._handleSearch}
          placeholder="Search for a food..."
        />
      </React.Fragment>
    );
  }

  _handleChange = (selection: any) => {
    this.props.onChange(selection.length ? selection[0].value : null);
  }

  _handleSearch = (query: string) => {
    this.setState({isLoading: true});
    getIngredientDatabase().searchFoods(query).then(foodRefs => {
      this.setState({
        isLoading: false,
        options: foodRefs.map(foodRef => ({
          label: foodRef.description,
          value: foodRef.identifier
        })),
      });
    })
  }
}

export function main() {
  ReactDOM.render(<IngredientSearcher onChange={(selected) => { console.log(selected)}}/>, document.getElementById('root'));
};
