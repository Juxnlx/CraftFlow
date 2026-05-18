import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
// @ts-ignore: getReactNativePersistence existe en runtime pero falta en los types públicos de firebase v12
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Configuración de Firebase para CraftFlow.
 * Las credenciales corresponden al proyecto de Firebase Console.
 */
const firebaseConfig = {
  apiKey: "AIzaSyBe5Ix498c2ik5Lkee6oTdOF6bjL1u_HH0",
  authDomain: "craftflow-tfg.firebaseapp.com",
  projectId: "craftflow-tfg",
  storageBucket: "craftflow-tfg.firebasestorage.app",
  messagingSenderId: "70016987112",
  appId: "1:70016987112:web:a548b3cfe0eaf846217e5d",
};

const app = initializeApp(firebaseConfig);

/**
 * Servicio de autenticación de Firebase. Usamos AsyncStorage como
 * persistencia para que la sesión sobreviva al cierre completo de la
 * app y solo se cierre cuando el usuario pulse "Cerrar sesión".
 */
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

/** Base de datos Firestore (colecciones de usuarios, materiales, proyectos...) */
export const db = getFirestore(app);

/** Almacenamiento de archivos (fotos de perfil, imágenes de proyectos...) */
export const storage = getStorage(app);

export default app;
