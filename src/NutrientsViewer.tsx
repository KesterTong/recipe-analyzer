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
import { Form, Table } from 'react-bootstrap';

export interface NutrientsViewProps {
  nutrientNames: string[],
  nutrientValues: number[],
  quantities: string[],
  selectedQuantity: number,
  setSelectedQuantity: (index: number) => void,
}

export const NutrientsViewer: React.SFC<NutrientsViewProps> = (props) => {
  return (
    <React.Fragment>
      <Form.Control as="select" value={props.selectedQuantity.toString()} onChange={(event: React.FormEvent) => props.setSelectedQuantity(Number((event.target as HTMLSelectElement).value))}>
        { props.quantities.map((quantity, index) => <option value={index}>{quantity}</option>) }
      </Form.Control>
      <p>
      <Table striped bordered hover>
        <thead>
          <tr>
            {props.nutrientNames.map(nutrientName => <th>{nutrientName}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            {props.nutrientValues.map(nutrientValue => <td>{nutrientValue}</td>)}
          </tr>
        </tbody>
      </Table>
      </p>
    </React.Fragment>
  );
}
