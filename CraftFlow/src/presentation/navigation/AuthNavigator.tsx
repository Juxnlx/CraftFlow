import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../../app/views/auth/LoginScreen";
import { RegisterScreen } from "../../app/views/auth/RegisterScreen";
import { ForgotPasswordScreen } from "../../app/views/auth/ForgotPasswordScreen";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Stack de autenticación.
 * Contiene Login, Register y ForgotPassword sin tab bar.
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
