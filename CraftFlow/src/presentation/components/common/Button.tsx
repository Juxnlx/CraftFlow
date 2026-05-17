import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";

/** Props del botón reutilizable */
interface ButtonProps {
  /** Texto que se muestra en el botón */
  title: string;
  /** Acción a ejecutar al pulsar */
  onPress: () => void;
  /** Variante visual; por defecto "primary" */
  variant?: "primary" | "outline" | "danger";
  /** Si es true muestra un spinner en lugar del texto */
  loading?: boolean;
  /** Desactiva la interacción y baja la opacidad */
  disabled?: boolean;
  /** Estilos adicionales aplicados al contenedor */
  style?: ViewStyle;
}

/**
 * Botón reutilizable con tres variantes visuales.
 * - primary: fondo marrón tierra, texto blanco
 * - outline: fondo transparente, borde gris
 * - danger: fondo transparente, borde y texto rojo
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "outline" && styles.outline,
        variant === "danger" && styles.danger,
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? COLORS.white : COLORS.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "primary" && styles.textPrimary,
            variant === "outline" && styles.textOutline,
            variant === "danger" && styles.textDanger,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  danger: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  textPrimary: {
    color: COLORS.white,
  },
  textOutline: {
    color: COLORS.textMid,
  },
  textDanger: {
    color: COLORS.danger,
  },
});
