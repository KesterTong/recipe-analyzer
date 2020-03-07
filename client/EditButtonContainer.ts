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
import { Action, toggleEditMode } from './actions';
import { RootState } from './RootState';
import { connect } from 'react-redux';

import { EditButton } from './EditButton';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

function mapStateToProps(state: RootState) {
  return {
    editable: state.ingredientIdentifier?.identifierType == 'BookmarkId',
    editMode: state.editMode,
  }
}

function mapDispatchToProps(dispatch: ThunkDispatch<RootState, null, Action>) {
  return bindActionCreators({toggleEditMode}, dispatch);
}
 
export const EditButtonContainer = connect(mapStateToProps, mapDispatchToProps)(EditButton);