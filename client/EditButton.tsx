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
import * as React from 'react';
import { Button } from 'react-bootstrap';

export interface EditButtonProps {
  editable: boolean,
  editMode: boolean,
  toggleEditMode: () => void,
};

export const EditButton: React.SFC<EditButtonProps> = (props) => {
  return <Button disabled={!props.editable} onClick={props.toggleEditMode}>
    {props.editMode ? 'Done' : 'Edit'}
  </Button>;
}
