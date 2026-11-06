import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// `firebase/auth` only ships web typings, but at runtime Metro bundles Firebase's React Native
// build, which does export getReactNativePersistence. Typed locally so tsc stays strict.
const { getReactNativePersistence } = require('firebase/auth') as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

const firebaseConfig = {
  apiKey: "AIzaSyC8rL7bz7rZh84VCZM9-GJo4c_MxotlGJc",
  authDomain: "universehub-41041.firebaseapp.com",
  projectId: "universehub-41041",
  storageBucket: "universehub-41041.firebasestorage.app",
  messagingSenderId: "350957917183",
  appId: "1:350957917183:web:29bd6f31d47ab8fd910dca",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// On native, keep the login session between app launches using AsyncStorage.
// (Web uses the default browser persistence.)
export const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : (() => {
        try {
          return initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
          });
        } catch {
          // initializeAuth throws if called twice (e.g. fast refresh)
          return getAuth(app);
        }
      })();

export const db = getFirestore(app);
