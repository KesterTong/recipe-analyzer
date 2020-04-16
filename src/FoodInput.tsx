import * as React from "react";

import { AsyncTypeahead } from "react-bootstrap-typeahead";
import { searchFoods } from "./database";
import { State } from "./store/food_input";

export interface FoodInputProps extends State {
  select(foodId: string, description: string): void;
  deselect(): void;
}

export class FoodInput extends React.Component<FoodInputProps> {
  state = {
    isLoading: false,
    options: [],
  };

  render() {
    let selected: { label: string; value: string }[];
    let disabled: boolean;
    if (this.props.foodId && !this.props.deselected) {
      selected = [
        {
          label: this.props.description || "Loading",
          value: this.props.foodId,
        },
      ];
      disabled = this.props.description == null;
    } else {
      selected = [];
      disabled = false;
    }
    let onChange = (selected: { label: string; value: string }[]) => {
      if (selected.length > 0) {
        this.props.select(
          selected[0].value,
          selected[0].label,
        );
      } else {
        this.props.deselect();
      }
    };
    return (
      <React.Fragment>
        <AsyncTypeahead
          {...this.state}
          disabled={disabled}
          selected={selected}
          filterBy={(x) => true}
          onChange={onChange}
          minLength={3}
          onSearch={this._handleSearch}
          placeholder="Search for a food..."
        />
      </React.Fragment>
    );
  }

  _handleSearch = async (query: string) => {
    this.setState({ isLoading: true });
    const result = await searchFoods(query);
    const options = result.map((result) => ({
      label: result.description,
      value: result.foodId,
    }));
    this.setState({ isLoading: false, options });
  };
}
