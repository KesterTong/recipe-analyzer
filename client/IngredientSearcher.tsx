import * as React from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { IngredientIdentifier } from '../core/FoodRef';
import { IngredientDatabase } from '../core/IngredientDatabase';
import { Action } from './actions';

interface IngredientSearcherProps {
  dispatch(action: Action): void;
  ingredientDatabase: IngredientDatabase;
}

export class IngredientSearcher extends React.Component<IngredientSearcherProps> {
  state = {
    isLoading: false,
    options: [],
  };

  render() {
    return (<React.Fragment>
      <AsyncTypeahead {...this.state} filterBy={x => true} onChange={this._handleChange} minLength={3} onSearch={this._handleSearch} placeholder="Search for a food..." />
    </React.Fragment>);
  }

  _handleChange = (selection: any) => {
    this.props.dispatch({
      actionType: 'SelectFood',
      ingredientIdentifier: selection.length ? selection[0].value : null,
    });
  };

  _handleSearch = (query: string) => {
    this.setState({ isLoading: true });
    this.props.ingredientDatabase.searchFoods(query).then(foodRefs => {
      this.setState({
        isLoading: false,
        options: foodRefs.map(foodRef => ({
          label: foodRef.description,
          value: foodRef.identifier
        })),
      });
    });
  };
}
