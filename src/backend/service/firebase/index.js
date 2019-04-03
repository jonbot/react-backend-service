import firebase from "firebase";

const firebaseConfig = require("./config/" +
  process.env.REACT_APP_BACKEND_CONFIG);

let firebaseApp = {};


export const createClient = () => {
  return new Promise((resolve, reject) => {
    firebaseApp = firebase.initializeApp(firebaseConfig);
   
    if (isReady() !== "undefined") {
      let success = "Firebase app initted.";
      resolve({ result: success });
    } else {
      let error = { error: "Firebase app could not initialize." };
      reject(error);
    }

  });
};

export const isReady = () => {
  return typeof firebase.app().name !== "undefined";
};

export const watchData = (path = "", callback = null) => {
  let dataRef = firebaseApp.database().ref(path);

  dataRef.on("value", snapshot => {
    if (snapshot.val() !== null) {
      callback(snapshot.val(), path);
    }
  });
  return true;
};

export const getData = (path = "") => {
  let dataRef = firebaseApp.database().ref(path);

  return dataRef
    .once("value")
    .then(snapshot => {
      return Promise.resolve(snapshot.val());
    })
    .catch(error => {
      return Promise.reject(error);
    });
};

export const update = (path = "", vals = {}) => {
  return new Promise((resolve, reject) => {
    firebaseApp
      .database()
      .ref(path)
      .update(vals)
      .then(() => {
          resolve(vals);
        },
        function(error) {
          reject(error);
        }
      );
  });
};

export const create = (path = "", vals = {}) => {
  return new Promise((resolve, reject) => {
    firebaseApp
      .database()
      .ref(path)
      .push(vals)
      .then((newRef) => {
          resolve(newRef.key);
        },
        function(error) {
          reject(error);
        }
      );
  });
};