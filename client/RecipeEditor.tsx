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

import { NutrientInfo } from '../core/Nutrients';
import { Recipe } from '../core/Recipe';
import { Form } from 'react-bootstrap';

export interface RecipeEditorProps {
  description: string,
  updateDescription(value: string): void,
}

export const RecipeEditor: React.SFC<RecipeEditorProps> = (props) => {
  return <React.Fragment>
      <Form>
        <Form.Group controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              value={props.description}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.updateDescription(event.target.value)}
              />
        </Form.Group>
      </Form>
  </React.Fragment>;
}