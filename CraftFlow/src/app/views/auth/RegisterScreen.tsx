import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { observer } from "mobx-react-lite";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../presentation/navigation/AuthNavigator";
import { authVM } from "../../../presentation/viewmodels";
import { Button } from "../../../presentation/components/common/Button";
import { Input } from "../../../presentation/components/common/Input";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Register">;
};

/**
 * Pantalla de registro con nombre, email, contraseña y confirmación.
 */
export const RegisterScreen = observer(({ navigation }: RegisterScreenProps) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLocalError(null);
    authVM.clearError();

    if (!nombre.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setLocalError("Rellena todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    await authVM.register(email, password, nombre);
  };

  const errorToShow = localError || authVM.error;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require("../../../../assets/craftflow-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Únete a la comunidad CraftFlow</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nombre de usuario"
            placeholder="Tu nombre"
            value={nombre}
            onChangeText={(text) => { setNombre(text); setLocalError(null); }}
            required
          />

          <Input
            label="Email"
            placeholder="tu@email.com"
            value={email}
            onChangeText={(text) => { setEmail(text); setLocalError(null); }}
            keyboardType="email-address"
            required
          />

          <Input
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={(text) => { setPassword(text); setLocalError(null); }}
            secureTextEntry
            required
          />

          <Input
            label="Confirmar contraseña"
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChangeText={(text) => { setConfirmPassword(text); setLocalError(null); }}
            secureTextEntry
            required
          />

          {errorToShow && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorToShow}</Text>
            </View>
          )}

          <Button
            title="Registrarse"
            onPress={handleRegister}
            loading={authVM.isLoading}
          />
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.bottomLink}>
          <Text style={styles.bottomLinkText}>
            ¿Ya tienes cuenta? <Text style={styles.bold}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 160,
    height: 130,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMid,
  },
  form: {
    marginBottom: SPACING.xl,
  },
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
  bottomLink: {
    alignItems: "center",
  },
  bottomLinkText: {
    color: COLORS.textMid,
    fontSize: 14,
  },
  bold: {
    fontWeight: "700",
    color: COLORS.primary,
  },
});
