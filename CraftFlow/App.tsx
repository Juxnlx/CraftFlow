import "reflect-metadata";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./src/presentation/navigation/AppNavigator";

/**
 * Punto de entrada de la app. El AppNavigator decide si mostrar el flujo
 * de auth o la app principal según haya sesión iniciada.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
