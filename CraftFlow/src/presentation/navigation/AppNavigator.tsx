import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { authVM } from "../viewmodels";

/**
 * Navegador raíz de la app. Escucha el estado de sesión de Firebase y
 * decide si mostrar el flujo de autenticación o la app principal. Mientras
 * se resuelve la sesión muestra el splash con el logo.
 */
export const AppNavigator: React.FC = () => {
  /** null mientras se comprueba la sesión, true/false una vez resuelta */
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        // Si la sesión se cierra, limpiamos el usuario del ViewModel
        setIsLoggedIn(false);
        authVM.usuario = null;
      }
    });

    return unsubscribe;
  }, []);

  if (isLoggedIn === null) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
