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

import { Form, Navbar, Container, Button, Spinner } from "react-bootstrap";

import { FoodInput } from "./FoodInput";
import { BrandedFoodEditorContainer } from "./BrandedFoodEditorContainer";
import { FoodViewerContainer } from "./FoodViewerContainer";
import { RecipeEditorContainer } from "./RecipeEditorContainer";
import { FoodRef } from "../core/FoodRef";

interface MainProps {
  loading: boolean;
  foodRef: FoodRef | null;
  select(foodRef: FoodRef): void;
  deselect(): void;
  saveFood: () => void;
  newBrandedFood: () => void;
  newRecipe: () => void;
}

export const Main: React.SFC<MainProps> = (props) => {
  return (
    <React.Fragment>
      <Navbar bg="light" expand="lg">
        <Form inline>
          <FoodInput
            foodRef={props.foodRef}
            select={props.select}
            deselect={props.deselect}
          />
          &nbsp;
          <Button onClick={props.saveFood}>Save</Button>
          &nbsp;
          <Button onClick={props.newBrandedFood}>New Custom Food</Button>
          &nbsp;
          <Button onClick={props.newRecipe}>New Recipe</Button>
        </Form>
      </Navbar>
      <Container>
        {props.loading ? <Spinner animation="border"></Spinner> : null}
        <BrandedFoodEditorContainer />
        <RecipeEditorContainer />
        <FoodViewerContainer />
      </Container>
    </React.Fragment>
  );
};
