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

/** Props inyectadas por React Navigation a la pantalla de login */
type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Login">;
};

/**
 * Pantalla de inicio de sesión: logo, formulario y enlaces a registro
 * y recuperación de contraseña.
 */
export const LoginScreen = observer(({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /** Lanza el login; si tiene éxito, AppNavigator cambia de stack solo. */
  const handleLogin = async () => {
    const success = await authVM.login(email, password);
    if (success) {
      // La navegación al MainNavigator la dispara onAuthStateChanged
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../assets/craftflow-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>
            Descubre lo que puedes crear{"\n"}con lo que tienes
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="tu@email.com"
            value={email}
            onChangeText={(text) => { setEmail(text); authVM.clearError(); }}
            keyboardType="email-address"
            required
          />

          <Input
            label="Contraseña"
            placeholder="Tu contraseña"
            value={password}
            onChangeText={(text) => { setPassword(text); authVM.clearError(); }}
            secureTextEntry
            required
          />

          {authVM.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{authVM.error}</Text>
            </View>
          )}

          <Button
            title="Iniciar sesión"
            onPress={handleLogin}
            loading={authVM.isLoading}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.link}
          >
            <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        {/* Link a registro */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={styles.bottomLink}
        >
          <Text style={styles.bottomLinkText}>
            ¿No tienes cuenta? <Text style={styles.bold}>Regístrate</Text>
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
  logoContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 200,
    height: 160,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMid,
    textAlign: "center",
    lineHeight: 22,
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
  link: {
    alignItems: "center",
    marginTop: SPACING.md,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
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
