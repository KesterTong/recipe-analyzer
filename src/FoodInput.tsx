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
import * as Autosuggest from 'react-autosuggest';

// TODO: replace with actual suggestions
const foodSuggestions = [
  {
    description: 'My Recipe',
    url: "#abcd1234"
  },
  {
    description: 'FDC Food',
    url: "https://path.to.fdc.food"
  },
];

export class FoodInput extends React.Component<any, {value: string, url: string | null, suggestions: {description: string, url: string}[]}> {
  constructor() {
    super({});
    this.state = {
      value: '',
      url: null,
      suggestions: []
    };
  }

  onChange = (event: React.ChangeEvent, props: { newValue: any }) => {
    console.log('onChange');
    console.log(props.newValue);
    this.setState({
      value: props.newValue
    });
  };

  // TODO: actual suggestions
  onSuggestionsFetchRequested = (props: { value: any }) => {
    this.setState({
      suggestions: foodSuggestions,
    });
    setTimeout(() => {
      this.setState({
        suggestions: foodSuggestions.concat({description: 'extra', url: 'a'}),
      });
    }, 1000);
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  onKeyDown = (event: React.KeyboardEvent<Element>) => {
    if ((event.keyCode == 8 || event.keyCode == 46) && this.state.url !== null) {
      this.setState({value: '', url: null})
      event.preventDefault();
    }
  }

  render() {
    const { value, url, suggestions } = this.state;

    const inputProps = {
      placeholder: '',
      value,
      url,
      onChange: this.onChange,
      onKeyDown: this.onKeyDown,
    };

    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionHighlighted={params=>{
          console.log('onHighlight')
          console.log(params.suggestion)
        }}
        onSuggestionSelected={(event, params) => {
          console.log('onSelect')
          this.setState({
            url: params.suggestion.url
          });
        }}
        getSuggestionValue={suggestion => suggestion.description}
        renderSuggestion={suggestion => (
          <div>
            {suggestion.description}
          </div>
        )}
        renderInputComponent={
          (inputProps: any) => (
            <div className="input-container">
              { inputProps.url == null ? null :
                <div className="input-selection">
                <span>{inputProps.value}</span>
                </div>
              }
              <input {...inputProps} value={inputProps.url == null ? inputProps.value: ""} />
            </div>
          )  
        }
        inputProps={inputProps}
      />
    );
  }
}