import * as React from "react";

import { AsyncTypeahead } from "react-bootstrap-typeahead";
import { searchFoods } from "./database";
import { FoodRef } from "../core/FoodRef";

export interface FoodInputProps {
  foodRef: FoodRef | null;
  select(foodRef: FoodRef): void;
  deselect(): void;
}

export class FoodInput extends React.Component<FoodInputProps> {
  state = {
    isLoading: false,
    options: [],
  };

  render() {
    let foodRef = this.props.foodRef;
    let selected = foodRef
      ? [{ label: foodRef.description, value: foodRef.foodId }]
      : [];
    let onChange = (selected: { label: string; value: string }[]) => {
      if (selected.length > 0) {
        this.props.select({
          foodId: selected[0].value,
          description: selected[0].label,
        });
      } else {
        this.props.deselect();
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
    const options = result.map((foodRef) => ({
      label: foodRef.description,
      value: foodRef.foodId,
    }));
    this.setState({ isLoading: false, options });
  };
}
