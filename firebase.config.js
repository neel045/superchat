import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyA94caail3O2qBOqzzEru3SgydK5HJjCZc",
    authDomain: "chat-app-1f0f0.firebaseapp.com",
    projectId: "chat-app-1f0f0",
    storageBucket: "chat-app-1f0f0.appspot.com",
    messagingSenderId: "1086248470081",
    appId: "1:1086248470081:web:0be5407727c9671a1728c0",
    measurementId: "G-KY6H0WG2FB",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)
