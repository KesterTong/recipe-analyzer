import * as React from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

export interface IngredientSearcherProps {
  selected: {label: string, value: string}[],
  disabled: boolean,
  autocomplete(query: string): Promise<{label: string, value: string}[]>,
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

  _handleSearch = (query: string) => {
    this.setState({ isLoading: true });
    this.props.autocomplete(query).then(options => this.setState({isLoading: false, options}));
  };
}
