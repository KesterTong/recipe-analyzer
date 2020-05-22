// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import * as React from "react";
import * as Autosuggest from "react-autosuggest";
import { searchFdcFoods } from "../food_data_central";
import { FoodReference } from "../core/FoodReference";
import { Config } from "../config/config";

interface Props {
  id: string;
  suggestions: FoodReference[];
  value: { description: string; url: string | null };
  config: Config;
  onChange(newValue: { description: string; url: string | null }): void;
}

// TODO: make this part of config.
const minCharsToQueryFDC = 3;

export class FoodInput extends React.Component<
  Props,
  {
    suggestions: FoodReference[];
  }
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      suggestions: [],
    };
  }

  onSuggestionsFetchRequested = async (props: { value: any }) => {
    // TODO: filter this.props.suggestions.
    this.setState({
      suggestions: this.props.suggestions,
    });
    if (props.value.length < minCharsToQueryFDC) {
      return;
    }
    const suggestions = await searchFdcFoods(props.value, this.props.config.fdcApiKey);
    this.setState({ suggestions: this.props.suggestions.concat(suggestions) });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  render() {
    const { suggestions } = this.state;
    const { value } = this.props;

    const inputProps = {
      placeholder: "",
      value: value.url == null ? value.description : "",
      id: this.props.id,
      onChange: (event: React.ChangeEvent, props: { newValue: any }) => {
        // Ignore changes for the input if a food with URL is selected.
        if (value.url !== null) {
          return;
        }
        this.props.onChange({ url: null, description: props.newValue });
      },
      onKeyDown: (event: React.KeyboardEvent<Element>) => {
        if (value.url !== null && (event.keyCode == 8 || event.keyCode == 46)) {
          this.props.onChange({ description: "", url: null });
        }
      },
    };

    return (
      <Autosuggest
        alwaysRenderSuggestions={this.props.value.url === null}
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionSelected={(event, params) => {
          // Note that inputProps.onChange will also fire before this event.
          // On the client side this doesn't matter, on the server side this
          // is handled by debouncing.
          this.props.onChange(params.suggestion);
        }}
        getSuggestionValue={(suggestion) => suggestion.description}
        renderSuggestion={(suggestion) => <div>{suggestion.description}</div>}
        renderInputComponent={(inputProps: any) => (
          <div className="input-container">
            {value.url == null ? null : (
              <div className="input-selection">
                <span>{value.description}</span>
              </div>
            )}
            <input {...inputProps} />
          </div>
        )}
        inputProps={inputProps}
      />
    );
  }
}
