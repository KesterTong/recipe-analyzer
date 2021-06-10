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

import { mapStateToMaybeProps } from "./MaybeComponent";
import { StateProps, Editor } from "./Editor";
import { RootState } from "./RootState";
import { selectIngredient, selectRecipe } from "./actions";
import { ThunkDispatch } from "./store";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

const mapStateToProps = mapStateToMaybeProps<RootState, StateProps>((state) => {
  if (state.type !== "Active") {
    return null;
  }
  const recipe = state.recipes[state.selectedRecipeIndex];
  return {
    selectedRecipeIndex: state.selectedRecipeIndex,
    selectedIngredientIndex: state.selectedIngredientIndex,
    numIngredients: recipe.ingredients.length,
  };
});

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators(
    {
      selectIngredient,
      selectRecipe,
    },
    dispatch
  );
}

export const EditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor);
