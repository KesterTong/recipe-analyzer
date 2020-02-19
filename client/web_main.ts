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
import { setIngredientDatabase } from "./IngredientDatabase";
import { IngredientDatabaseImpl } from "./IngredientDatabaseImpl";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Start auth
var ui = new firebaseui.auth.AuthUI(firebase.auth());

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    main();
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



setIngredientDatabase(new IngredientDatabaseImpl());