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

import { IngredientSearcher } from "./IngredientSearcher";
import { BrandedFoodEditor } from "./BrandedFoodEditor";
import {
  selectAndLoad,
  saveFood,
  newBrandedFood,
  newRecipe,
  deselect,
} from "./store/actions";
import { RootState, selectFoodRef } from "./store";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { SRLegacyFoodViewer } from "./SRLegacyFoodView";
import { RecipeEditorContainer } from "./RecipeEditorContainer";
import { ThunkDispatch } from "./store/types";
import { FoodRef } from "../core/FoodRef";

interface IngredientBrowserProps {
  loading: boolean;
  foodRef: FoodRef | null;
  select(foodRef: FoodRef): void;
  deselect(): void;
  saveFood: () => void;
  newBrandedFood: () => void;
  newRecipe: () => void;
}

const IngredientBrowserView: React.SFC<IngredientBrowserProps> = (props) => {
  return (
    <React.Fragment>
      <Navbar bg="light" expand="lg">
        <Form inline>
          <IngredientSearcher
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
        <BrandedFoodEditor />
        <RecipeEditorContainer />
        <SRLegacyFoodViewer />
      </Container>
    </React.Fragment>
  );
};

function mapStateToProps(state: RootState) {
  return {
    foodRef: selectFoodRef(state),
    loading: state.foodId != null && state.foodState?.stateType == "Loading",
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators(
    {
      deselect,
      select: selectAndLoad,
      saveFood,
      newBrandedFood,
      newRecipe,
    },
    dispatch
  );
}

export const IngredientBrowser = connect(
  mapStateToProps,
  mapDispatchToProps
)(IngredientBrowserView);
