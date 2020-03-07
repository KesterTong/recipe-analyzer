import * as React from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { IngredientIdentifier, FoodRef } from '../core/FoodRef';
import { Action, selectFood } from './actions';
import { RootState } from './RootState';
import { IngredientDatabaseImpl } from './IngredientDatabaseImpl';
import { connect } from 'react-redux';

interface IngredientSearcherProps {
  selected: {label: string, value: IngredientIdentifier}[],
  selectFood(ingredientIdentifier: IngredientIdentifier, description: string): void,
}

export class IngredientSearcherView extends React.Component<IngredientSearcherProps> {
  state = {
    isLoading: false,
    options: [],
  };

  render() {
    return (<React.Fragment>
      <AsyncTypeahead
        {...this.state}
        selected={this.props.selected}
        filterBy={x => true}
        onChange={(selected: any) => {
          if(selected.length) {
            this.props.selectFood(selected[0].value, selected[0].label)
          }
        }}
        minLength={3} onSearch={this._handleSearch}
        placeholder="Search for a food..." />
    </React.Fragment>);
  }

  _handleSearch = (query: string) => {
    this.setState({ isLoading: true });
    new IngredientDatabaseImpl().searchFoods(query).then(foodRefs => {
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

function mapStateToProps(state: RootState) {
  let ingredientIdentifier = state.ingredientIdentifier;
  return {
    selected: ingredientIdentifier ? [{
      label: state.food?.description || '',
      value: ingredientIdentifier,
    }] : [],
  };
}

function mapDispatchToProps(dispatch: React.Dispatch<Action>) {
  return {
    selectFood: (ingredientIdentifier: IngredientIdentifier, description: string) => selectFood(dispatch, ingredientIdentifier, description),
  };
}

export const IngredientSearcher = connect(mapStateToProps, mapDispatchToProps)(IngredientSearcherView);