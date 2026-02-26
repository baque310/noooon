importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAGXMQK5LxWMy8VHh-LOx2Kxf6Lskrim6M",
  authDomain: "noon-f0d05.firebaseapp.com",
  projectId: "noon-f0d05",
  storageBucket: "noon-f0d05.firebasestorage.app",
  messagingSenderId: "486586508241",
  appId: "1:486586508241:web:05d97edd2369596ae4b6f0",
  measurementId: "G-VMVJS5KFT2"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
 
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
