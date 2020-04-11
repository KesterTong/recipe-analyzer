import * as React from "react";

import { AsyncTypeahead } from "react-bootstrap-typeahead";
import { searchFoods } from "./database";
import { SelectedFood } from "./store/food_input";

export interface FoodInputProps {
  selected: SelectedFood | null;
  select(selected: SelectedFood | null): void;
}

export class FoodInput extends React.Component<FoodInputProps> {
  state = {
    isLoading: false,
    options: [],
  };

  render() {
    let selected = this.props.selected
      ? [
          {
            label: this.props.selected.description,
            value: this.props.selected.foodId,
          },
        ]
      : [];
    let onChange = (selected: { label: string; value: string }[]) => {
      if (selected.length > 0) {
        this.props.select({
          foodId: selected[0].value,
          description: selected[0].label,
        });
      } else {
        this.props.select(null);
      }
    };
    return (
      <React.Fragment>
        <AsyncTypeahead
          {...this.state}
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
