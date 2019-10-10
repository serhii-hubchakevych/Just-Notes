import * as firebase from 'firebase';
import firestore from 'firebase/firestore'


const config = {
  apiKey: "AIzaSyBAO_mf2MBh-9ZboRZIYt9CVTZ_y3PHALo",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "https://just-notes-71ece.firebaseio.com/",
  projectId: "just-notes-71ece",
  storageBucket: "ust-notes-71ece.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID"
};
firebase.initializeApp(config);


export default firebase;