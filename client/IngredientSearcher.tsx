import * as React from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { IngredientIdentifier } from '../core/FoodRef';
import { IngredientDatabase } from '../core/IngredientDatabase';
import { Action, selectFood } from './actions';
import { RootState } from './RootState';
import { IngredientDatabaseImpl } from './IngredientDatabaseImpl';
import { connect } from 'react-redux';

interface IngredientSearcherProps {
  selectFood(ingredientIdentifier: IngredientIdentifier | null): void;
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
        filterBy={x => true}
        onChange={(selection: any) => this.props.selectFood(selection.length ? selection[0].value : null)}
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
  return {};
}

function mapDispatchToProps(dispatch: React.Dispatch<Action>) {
  return {
    selectFood: (ingredientIdentifier: IngredientIdentifier | null) => selectFood(dispatch, ingredientIdentifier),
  };
}

export const IngredientSearcher = connect(mapStateToProps, mapDispatchToProps)(IngredientSearcherView);