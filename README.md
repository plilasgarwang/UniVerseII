# UniVerse (React Native) — Project II

Cross-platform (Android + iOS) rebuild of the Project I campus companion, extended with
cloud sync, push notifications, persistent grade history and class-rep timetable publishing.

## What's carried over from Project I
Login / Signup / Reset password · Notice Feed · Class Timetable · Grade Calculator · Digital Library Card (Code 128 barcode) · Profile / Logout

## What's new in Project II
| Feature | How it works |
|---|---|
| Cloud-synced notices | Firestore `notices` collection with a live `onSnapshot` listener - a notice posted on one phone appears on every phone instantly |
| Push notifications | Each device saves its Expo push token on sign-in; publishing a notice sends a push to every other device via Expo's push service |
| Persistent grade history | "Save to history" stores each GPA calculation under `users/{uid}/grades`; reload it into the calculator later |
| Class-rep timetable publishing | Users who sign up as a class rep can publish the IT03 timetable, add classes and remove classes; students see changes live |
| Cross-platform | One TypeScript codebase for Android and iOS |

## Run it
1. `npm install`
2. Create a Firebase project → enable **Authentication → Email/Password** and **Firestore Database**.
3. Copy `.env.example` to `.env` and paste your Firebase **web app** config values.
4. Paste `firestore.rules` into Firestore → Rules and publish.
5. `npx expo start` then scan the QR code with **Expo Go** (Android/iOS), or press `a` / `i` for an emulator/simulator.
   After editing `.env`, restart with `npx expo start -c`.

### Push notifications
- Need a **physical device** (simulators can't receive pushes).
- Expo Go on Android no longer supports remote push; use a development build (`npx eas init`, put the project id in `EXPO_PUBLIC_EAS_PROJECT_ID`, then `npx eas build --profile development --platform android`). iOS pushes need an Apple developer setup through EAS as well.
- Everything else works in Expo Go; the app simply skips push registration if it isn't available.

## Project structure
```
App.tsx                      entry: providers + navigation
src/firebase.ts              Firebase init (auth persisted with AsyncStorage)
src/context/AuthContext.tsx  sign in / sign up / reset / logout, user role
src/services/                notices, timetable, grades, notifications, cardStorage
src/screens/                 Login, Signup, ResetPassword, NoticeFeed, Timetable, Tools, GradeCalculator, LibraryCard, Profile
src/components/              shared UI + Barcode (Code 128 via jsbarcode + react-native-svg)
src/data/seedTimetable.ts    IT03 starter timetable (edit rooms to match yours)
firestore.rules              security rules
```

## Known limitations
- The "class representative" role is self-selected at signup (no admin approval). Fine for a class project; a real deployment would assign it from an admin console.
- Push messages are sent from the client. Production should send them from a Cloud Function so tokens are never readable by other users.
- Timetable room names are generic ("IT03 Classroom", "Computer Lab") because the source timetable had no room numbers.
