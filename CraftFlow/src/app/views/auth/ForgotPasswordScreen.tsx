import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { observer } from "mobx-react-lite";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../presentation/navigation/AuthNavigator";
import { authVM } from "../../../presentation/viewmodels";
import { Button } from "../../../presentation/components/common/Button";
import { Input } from "../../../presentation/components/common/Input";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";

/** Props inyectadas por React Navigation a la pantalla de recuperación */
type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "ForgotPassword">;
};

/**
 * Pantalla de recuperación de contraseña. Tiene dos estados: formulario
 * para introducir el email y pantalla de confirmación cuando ya se ha
 * enviado el correo.
 */
export const ForgotPasswordScreen = observer(({ navigation }: ForgotPasswordScreenProps) => {
  const [email, setEmail] = useState("");

  /** Envía el correo de recuperación al email introducido. */
  const handleReset = async () => {
    await authVM.resetPassword(email);
  };

  /** Resetea el estado del VM y vuelve al login. */
  const handleGoBack = () => {
    authVM.resetPasswordSent = false;
    authVM.clearError();
    navigation.goBack();
  };

  // Estado de confirmación: correo enviado
  if (authVM.resetPasswordSent) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.title}>¡Correo enviado!</Text>
        <Text style={styles.subtitle}>
          Revisa tu bandeja de entrada en {email} y sigue las instrucciones para
          restablecer tu contraseña.
        </Text>
        <Button title="Volver al inicio" onPress={handleGoBack} style={styles.button} />
      </View>
    );
  }

  // Estado de formulario
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔑</Text>
      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.subtitle}>
        Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
      </Text>

      <View style={styles.form}>
        <Input
          label="Email"
          placeholder="tu@email.com"
          value={email}
          onChangeText={(text) => { setEmail(text); authVM.clearError(); }}
          keyboardType="email-address"
        />

        {authVM.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{authVM.error}</Text>
          </View>
        )}

        <Button
          title="Enviar enlace"
          onPress={handleReset}
          loading={authVM.isLoading}
        />

        <Button
          title="Volver"
          onPress={handleGoBack}
          variant="outline"
          style={styles.backButton}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
  },
  icon: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMid,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  form: {},
  errorContainer: {
    backgroundColor: "#FDF2F2",
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    alignSelf: "center",
    paddingHorizontal: SPACING.xl,
  },
  backButton: {
    marginTop: SPACING.sm,
  },
});
