import * as React from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { searchFoods } from './IngredientDatabaseImpl';

export interface IngredientSearcherProps {
  selected: {label: string, value: string}[],
  disabled: boolean,
  select(selected: {label: string, value: string}[]): void,
}

export class IngredientSearcher extends React.Component<IngredientSearcherProps> {
  state = {
    isLoading: false,
    options: [],
  };

  render() {
    return (<React.Fragment>
      <AsyncTypeahead
        {...this.state}
        selected={this.props.selected}
        disabled={this.props.disabled}
        filterBy={x => true}
        onChange={this.props.select}
        minLength={3} onSearch={this._handleSearch}
        placeholder="Search for a food..." />
    </React.Fragment>);
  }

  _handleSearch = async (query: string) => {
    this.setState({ isLoading: true });
    const result = await searchFoods(query);
    const options = result.map(foodRef => ({label: foodRef.description, value: foodRef.foodId}));
    this.setState({isLoading: false, options});
  };
}
