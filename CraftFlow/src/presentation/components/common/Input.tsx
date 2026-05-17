import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  KeyboardTypeOptions,
} from "react-native";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";

/** Props del campo de entrada reutilizable */
interface InputProps {
  /** Etiqueta que se muestra encima del campo */
  label?: string;
  /** Texto de marcador cuando está vacío */
  placeholder?: string;
  /** Valor controlado del input */
  value: string;
  /** Callback llamado en cada cambio de texto */
  onChangeText: (text: string) => void;
  /** Oculta los caracteres (para contraseñas) */
  secureTextEntry?: boolean;
  /** Tipo de teclado (numérico, email, etc.) */
  keyboardType?: KeyboardTypeOptions;
  /** Mensaje de error a mostrar debajo del input */
  error?: string | null;
  /** Permite varias líneas en el input */
  multiline?: boolean;
  /** Número de líneas iniciales si es multilínea */
  numberOfLines?: number;
  /** Estilos adicionales del contenedor */
  style?: ViewStyle;
  /** Si es true muestra un asterisco rojo junto al label */
  required?: boolean;
}

/**
 * Input reutilizable con label superior y mensaje de error.
 * Cambia el borde a rojo cuando tiene error.
 * Si required es true, muestra un asterisco rojo junto al label.
 */
export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  error,
  multiline = false,
  numberOfLines = 1,
  style,
  required = false,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={{ color: COLORS.danger }}> *</Text>}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          multiline ? styles.multiline : null,
        ]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMid,
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  multiline: {
    minHeight: 100,
    paddingTop: SPACING.md,
  },
  error: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
});
