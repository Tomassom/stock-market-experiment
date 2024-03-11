if (typeof firebase === 'undefined') throw new Error('hosting/init-error: Firebase SDK not detected. You must include it before /__/firebase/init.js');
firebase.initializeApp({
  "apiKey": "AIzaSyCI9GU54mf5u8XhCe27c2cD2okEauznBy4",
  "appId": "1:687650975655:web:df07b7305312aaa8ed5082",
  "authDomain": "stock-market-experiment.firebaseapp.com",
  "databaseURL": "https://stock-market-experiment.firebaseio.com",
  "measurementId": "G-DY0THS5JN5",
  "messagingSenderId": "687650975655",
  "projectId": "stock-market-experiment",
  "storageBucket": "stock-market-experiment.appspot.com"
});