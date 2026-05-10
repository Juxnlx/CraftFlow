import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { authVM } from "../viewmodels";

/**
 * Navegador raíz de la aplicación.
 * Escucha onAuthStateChanged de Firebase para decidir si mostrar
 * el flujo de autenticación o la app principal.
 *
 * Estados:
 * - null: cargando (splash screen con logo)
 * - false: sin sesión → AuthNavigator
 * - true: con sesión → MainNavigator
 */
export const AppNavigator: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Actualizar el ViewModel con los datos básicos del usuario
        // El documento completo se carga cuando se necesita
        setIsLoggedIn(true);
      } else {
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
