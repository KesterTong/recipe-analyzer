import * as React from "react";

import { Autocomplete } from '@material-ui/lab';
import { searchFoods } from "./database";
import { State } from "./store/food_input";
import { TextField } from "@material-ui/core";

import { QueryResult } from "./database";

export interface FoodInputProps extends State {
  select(foodId: string, description: string): void;
  deselect(): void;
}

// TODO: replace by QueryResult
interface Option {
  label: string,
  value: string,
}

export class FoodInput extends React.Component<FoodInputProps, {isLoading: boolean, options: Option[]}> {
  state = {
    isLoading: false,
    options: [],
  };

  render() {
    let selected: Option | null;
    let disabled: boolean;
    if (this.props.foodId && !this.props.deselected) {
      selected = {
        label: this.props.description || "Loading",
        value: this.props.foodId,
      };
      disabled = this.props.description == null;
    } else {
      selected = null;
      disabled = false;
    }
    let onChange = (selected: { label: string; value: string }[]) => {
      if (selected.length > 0) {
        this.props.select(selected[0].value, selected[0].label);
      } else {
        this.props.deselect();
      }
    };
    return (
      <React.Fragment>
        <Autocomplete
          id="combo-box-demo"
          options={this.state.options}
          value={selected}
          filterOptions={(options: Option[], _) => options}
          getOptionLabel={(option: Option) => option.label}
          style={{ width: 300 }}
          renderInput={(params) => <TextField {...params}/>}
          onInputChange={(event, newValue: string) => {
            this._handleSearch(newValue);
          }}
          onChange={(event: any, newValue: any) => {
            if (newValue === null) {
              this.props.deselect();
            } else {
              this.props.select(newValue.value, newValue.label);
            }
          }}
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
