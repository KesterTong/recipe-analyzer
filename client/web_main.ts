// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase";
import * as firebaseui from "firebaseui";

import { firebaseConfig } from './firebase_config';

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
