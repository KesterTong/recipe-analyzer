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

type MaybeStateProps<StateProps> = { stateProps: StateProps | null };

/**
 * A component that can optionally display nothing.
 *
 * This is useful for handling the situation where a component gets
 * rendered when the redux state is such that the compoment is not valid.
 * Doing so is tricky to do in a type-safe manner due to how components
 * and `connect` are typed.
 */
export function MaybeComponent<StateProps, DispatchProps>(
  component: React.FunctionComponent<StateProps & DispatchProps>
): React.FunctionComponent<MaybeStateProps<StateProps> & DispatchProps> {
  return (props) => {
    if (props.stateProps === null) {
      return null;
    }
    return component({ ...props.stateProps, ...props });
  };
}

export function mapStateToMaybeProps<RootState, StateProps>(
  mapStateToProps: (state: RootState) => StateProps | null
) {
  return (state: RootState) => ({ stateProps: mapStateToProps(state) });
}
