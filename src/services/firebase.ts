// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { Messaging, getMessaging } from "firebase/messaging";
import { apiKey, appId, authDomain, measurementId, messagingSenderId, projectId, storageBucket } from "./types/config";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

var messaging: Messaging;

if (typeof window !== "undefined" && app) {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/firebase-messaging-sw.js").then(
        function (registration) {
          // Registration was successful
          messaging = getMessaging(app);
        },
        function (err) {
          // Registration failed :(
          console.log("ServiceWorker registration failed: ", err);
        }
      );
    });
  }
}

export { messaging };
