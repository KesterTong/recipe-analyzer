import * as React from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { searchFoods } from './IngredientDatabaseImpl';
import { FoodRef } from '../core/FoodRef';

export interface IngredientSearcherProps {
  foodRef: FoodRef | null,
  deselected: boolean,
  select(foodRef: FoodRef): void,
  deselect(): void,
}

export class IngredientSearcher extends React.Component<IngredientSearcherProps> {
  state = {
    isLoading: false,
    options: [],
  };

  render() {
    let foodRef = this.props.foodRef;
    let deselected = this.props.deselected;
    let selected = foodRef && !deselected ? [{label: foodRef.description, value: foodRef.foodId}]: [];
    let onChange = (selected: {label: string, value: string}[]) => {
      if (selected.length > 0) {
        this.props.select({foodId: selected[0].value, description: selected[0].label});
      } else {
        this.props.deselect();
      }
    }
    return (<React.Fragment>
      <AsyncTypeahead
        {...this.state}
        selected={selected}
        filterBy={x => true}
        onChange={onChange}
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
