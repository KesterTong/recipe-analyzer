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

import {
  Button,
  AppBar,
  Toolbar,
  Container,
  CircularProgress,
  makeStyles,
  Box,
  Icon,
  IconButton,
  Menu,
  withStyles,
  MenuItem,
} from "@material-ui/core";

import { FoodInput } from "./FoodInput";
import { BrandedFoodEditorContainer } from "./BrandedFoodEditorContainer";
import { FoodViewerContainer } from "./FoodViewerContainer";
import { RecipeEditorContainer } from "./RecipeEditorContainer";
import * as food_input from "./store/food_input";
import { blue } from "@material-ui/core/colors";

interface MainProps {
  loading: boolean;
  selected: food_input.State;
  select(foodId: string, description: string): void;
  deselect(): void;
  saveFood: () => void;
  newBrandedFood: () => void;
  newRecipe: () => void;
}

const useStyles = makeStyles({
  root: {
    background: blue[300],
  },
});

export const Main: React.FunctionComponent<MainProps> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

  const classes = useStyles();
  return (
    <React.Fragment>
      <AppBar className={classes.root} position="static">
        <Toolbar>
          <Icon>search</Icon>
          <FoodInput
            {...props.selected}
            select={props.select}
            deselect={props.deselect}
          />
          <IconButton onClick={props.saveFood}>
            <Icon>save</Icon>
          </IconButton>
          <div>
            <IconButton
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={(event) => setAnchorEl(event.currentTarget)}
            >
              <Icon>create</Icon>
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  props.newRecipe();
                }}
              >
                Recipe
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  props.newBrandedFood();
                }}
              >
                Custom Food
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <Container>
        <Box my={4}>
          {props.loading ? <CircularProgress /> : null}
          <BrandedFoodEditorContainer />
          <RecipeEditorContainer />
          <FoodViewerContainer />
        </Box>
      </Container>
    </React.Fragment>
  );
};
