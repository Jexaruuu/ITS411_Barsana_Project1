// constants/firebase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as Auth from 'firebase/auth'; // <— import namespace to allow fallback typing
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyAtRxFtutkVxhU7ngsGU_twwRsnryJqAOI',
  authDomain: 'its411-barsana-project.firebaseapp.com',
  projectId: 'its411-barsana-project',
  storageBucket: 'its411-barsana-project.firebasestorage.app',
  messagingSenderId: '999284187418',
  appId: '<YOUR_WEB_APP_ID>',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const getRNPersistence =
  (Auth as any).getReactNativePersistence as
    | ((storage: typeof AsyncStorage) => any)
    | undefined;

let auth: Auth.Auth;

if (Platform.OS === 'web') {
  // Web default
  auth = Auth.getAuth(app);
} else {
  try {
    auth = Auth.initializeAuth(app, {
      // If TS can’t “see” getReactNativePersistence, we still run at runtime.
      // If undefined, Auth will fall back to in-memory persistence.
      persistence: getRNPersistence ? getRNPersistence(AsyncStorage) : undefined,
    });
  } catch {
    // If already initialized (Fast Refresh), fall back to getAuth
    auth = Auth.getAuth(app);
  }
}

const db = getFirestore(app);

export { app, auth, db };

