Informer - EPFL JE Workshop
This project is a mobile news application built with React Native (Expo) as part of a workshop hosted by the Junior Entreprise (JE) club at EPFL.

The primary goal was to build a complete, full-stack mobile application by integrating a third-party News API (EventRegistry) with Firebase for backend services, including user authentication and data persistence.

🚀 Features
This application includes a wide range of features, demonstrating a full auth and content flow:

-Dynamic News Feed:

Hero Article: The main feed performs two API calls: one to fetch the single most relevant article (based on source rank) as the "Hero" component, and a second to fetch the remaining articles sorted by date.

Server-Side Search: A functional search bar that queries the API by keyword, rather than filtering locally.

Refresh: A refresh button to reset the search and reload the latest articles.

-Firebase Authentication:

Full user registration (Sign Up) and login (Log In) flow using Firebase Auth.

Secure password handling and error management (e.g., "email already in use", "wrong password").

Protected navigation: users are redirected to the login screen on startup.

-User Profile & Data:

Profile Picture Upload: Users must select a profile picture during registration.

Firebase Storage: The selected image is uploaded to Firebase Storage.

Firestore Database: User data (pseudonym, email, and the profile picture URL) is saved in a "users" collection in Cloud Firestore.

Profile Page: A dedicated tab that displays the user's info (pseudonym, member since, email) and profile picture.

Change Profile Picture: Users can tap their picture on the profile screen to upload and update their photo at any time.

-Favorites System:

Save Articles: Users can tap a star icon on any article details page to save it as a favorite.

Firestore Persistence: Favorited articles (including title, body, and image) are saved in a separate "userFavorites" collection in Firestore, linked to the user's UID.

Favorites Tab: A dedicated tab that displays a list of all saved articles in real-time using onSnapshot.

-Local Caching (Per Requirements):

The user's profile picture is cached locally on the device using expo-file-system.

The path to this local file is saved using @react-native-async-storage/async-storage.

The profile screen prioritizes loading the fast local image from cache before falling back to the Firebase Storage URL.

-Design & Navigation:

Expo Router: All navigation is handled by Expo Router, using a Stack for authentication and Tabs for the main app.

Custom Design: The app is built with a custom dark-mode theme (#000000 / #1C1C1E).

Custom Fonts: Uses @expo-google-fonts (Merriweather for titles, Lato for body text) for a professional, editorial look.

🛠 Tech Stack
Framework: React Native (Expo)

Navigation: Expo Router

Backend: Firebase

Authentication: Firebase Auth

Database: Cloud Firestore

File Storage: Firebase Storage

API: EventRegistry (News API)

Local Storage:

@react-native-async-storage/async-storage (for storing local image URI)

expo-file-system (for caching the image)

-UI/UX:

expo-image-picker (for photo selection)

@expo-google-fonts (for custom typography)

@expo/vector-icons