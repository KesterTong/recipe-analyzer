import * as React from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { FoodRef } from '../core/FoodRef';

export interface IngredientSearcherProps {
  selected: FoodRef | null;
  autocomplete(query: string): Promise<FoodRef[]>,
  selectFood(foodRef: FoodRef): void,
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
        defaultSelected={this.props.selected ? [{label: this.props.selected.description, value: this.props.selected.foodId}] : []}
        filterBy={x => true}
        onChange={(selected: any) => {
          if(selected.length) {
            this.props.selectFood({foodId: selected[0].value, description: selected[0].label})
          }
        }}
        minLength={3} onSearch={this._handleSearch}
        placeholder="Search for a food..." />
    </React.Fragment>);
  }

  _handleSearch = (query: string) => {
    this.setState({ isLoading: true });
    this.props.autocomplete(query).then(foodRefs => {
      this.setState({
        isLoading: false,
        options: foodRefs.map(foodRef => ({
          label: foodRef.description,
          value: foodRef.foodId
        })),
      });
    });
  };
}
