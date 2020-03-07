import * as React from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { IngredientIdentifier, FoodRef } from '../core/FoodRef';

export interface IngredientSearcherProps {
  selected: FoodRef | null;
  autocomplete(query: string): Promise<FoodRef[]>,
  selectFood(ingredientIdentifier: IngredientIdentifier, description: string): void,
}

export class IngredientSearcher extends React.Component<IngredientSearcherProps> {
  state = {
    isLoading: false,
    options: [],
  };

  render() {
    let selected: {label: string, value: any}[] = [];
    if (this.props.selected) {
      selected = [{label: this.props.selected.description, value: this.props.selected.identifier}];
    }
    return (<React.Fragment>
      <AsyncTypeahead
        {...this.state}
        selected={selected}
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
    this.props.autocomplete(query).then(foodRefs => {
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
