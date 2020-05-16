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

export class FoodInput extends React.Component<
  { id: string; suggestions: { description: string; url: string }[] },
  {
    value: string;
    selection: { description: string; url: string } | null;
    suggestions: { description: string; url: string }[];
  }
> {
  constructor(props: {
    id: string;
    suggestions: { description: string; url: string }[];
  }) {
    super(props);
    this.state = {
      value: "",
      selection: null,
      suggestions: [],
    };
  }

  onChange = (event: React.ChangeEvent, props: { newValue: any }) => {
    console.log("onChange");
    console.log(props.newValue);
    this.setState({
      value: props.newValue,
    });
  };

  // TODO: actual suggestions
  onSuggestionsFetchRequested = (props: { value: any }) => {
    this.setState({
      suggestions: this.props.suggestions,
    });
    setTimeout(() => {
      this.setState({
        suggestions: this.props.suggestions.concat({
          description: "extra",
          url: "a",
        }),
      });
    }, 1000);
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  onKeyDown = (event: React.KeyboardEvent<Element>) => {
    if (this.state.selection !== null) {
      event.preventDefault();
      if (event.keyCode == 8 || event.keyCode == 46) {
        this.setState({ value: "", selection: null });
      }
    }
  };

  render() {
    const { value, selection, suggestions } = this.state;

    const inputProps = {
      placeholder: "",
      value,
      selection,
      id: this.props.id,
      onChange: this.onChange,
      onKeyDown: this.onKeyDown,
    };

    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionHighlighted={(params) => {
          console.log("onHighlight");
          console.log(params.suggestion);
        }}
        onSuggestionSelected={(event, params) => {
          console.log("onSelect");
          this.setState({
            value: "",
            selection: params.suggestion,
          });
        }}
        getSuggestionValue={(suggestion) => suggestion.description}
        renderSuggestion={(suggestion) => <div>{suggestion.description}</div>}
        renderInputComponent={(inputProps: any) => (
          <div className="input-container">
            {inputProps.selection == null ? null : (
              <div className="input-selection">
                <span>{inputProps.selection.description}</span>
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
