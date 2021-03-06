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

import { RecipeInput, StateProps } from "./RecipeInput";
import { mapStateToMaybeProps } from "./MaybeComponent";
import { RootState } from "./RootState";
import { bindActionCreators } from "redux";
import { ThunkDispatch } from "./store";
import { selectRecipe } from "./actions";
import { connect } from "react-redux";

const mapStateToProps = mapStateToMaybeProps<RootState, StateProps>((state) => {
  if (state.type != "Active") {
    return null;
  }
  return {
    recipeTitles: state.recipes.map((recipe) => recipe.title),
    selectedRecipeIndex: state.selectedRecipeIndex,
  };
});

function mapDispatchToProps(dispatch: ThunkDispatch) {
  return bindActionCreators(
    {
      selectRecipe,
    },
    dispatch
  );
}

export const RecipeInputContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RecipeInput);
