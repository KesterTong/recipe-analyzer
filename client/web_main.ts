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

// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase";
import * as firebaseui from "firebaseui";

import { firebaseConfig } from './firebase_config';
import { main } from "./ingredients";
import { setClientIngredientDatabase, ClientIngredientDatabase } from "./ClientIngredientDatabase";
import { IngredientIdentifier, FoodRef } from "../core/FoodRef";
import { Food } from "../core/Food";
import { NutrientInfo } from "../core/Nutrients";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Start auth
var ui = new firebaseui.auth.AuthUI(firebase.auth());

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log(user);
    // User is signed in.
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;
  } else {
    // User is signed out.
    ui.start('#firebaseui-auth-container', {
      callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
          return false;
        },
      },
      signInFlow: 'popup',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ],
    });
  }
});

class ClientIngredientDatabaseImpl implements ClientIngredientDatabase {
  getNutrientInfo(): Promise<NutrientInfo[]> {
    let settings = firebase.firestore().collection('settings')
    let nutrients = settings.doc('nutrients').get();
    return nutrients.then(documentData => JSON.parse(documentData.data()?.value));
  } 
  getFood(ingredientIdentifier: IngredientIdentifier): Promise<Food | null> {
    throw new Error("Method not implemented.");
  }
  patchFood(ingredientIdentifier: IngredientIdentifier, food: Food): Promise<void> {
    throw new Error("Method not implemented.");
  }
  searchFoods(arg: string): Promise<FoodRef[]> {
    throw new Error("Method not implemented.");
  }
  addIngredient(ingredientIdentifier: IngredientIdentifier, amount: number, unit: string, description: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

setClientIngredientDatabase(new ClientIngredientDatabaseImpl());
/**
 * Main entrypoint for AppsScript UI.
 */
$(main);

$(main);