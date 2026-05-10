import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../../../config/theme";

/**
 * Indicador de carga centrado con el logo de CraftFlow.
 * Se usa como splash screen y en estados de carga.
 */
export const LoadingSpinner: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>CraftFlow</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  text: {
    marginTop: SPACING.md,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
