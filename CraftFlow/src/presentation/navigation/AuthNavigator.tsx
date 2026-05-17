import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../../app/views/auth/LoginScreen";
import { RegisterScreen } from "../../app/views/auth/RegisterScreen";
import { ForgotPasswordScreen } from "../../app/views/auth/ForgotPasswordScreen";

/** Rutas del stack de autenticación con sus parámetros */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Stack que agrupa las pantallas de autenticación (Login, Register,
 * ForgotPassword). Se muestra cuando no hay sesión iniciada.
 */
export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
