import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";
import { Herramienta } from "../../../domain/entities/Herramienta";

/** Props de la tarjeta de herramienta */
interface HerramientaCardProps {
  /** Herramienta a mostrar en la tarjeta */
  herramienta: Herramienta;
  /** Acción al pulsar el botón de editar */
  onEdit: () => void;
  /** Acción al pulsar el botón de eliminar */
  onDelete: () => void;
}

/**
 * Tarjeta de herramienta en el inventario. Muestra nombre, tipo,
 * cantidad y las propiedades específicas (grosor, número, diámetro).
 */
export const HerramientaCard: React.FC<HerramientaCardProps> = ({
  herramienta,
  onEdit,
  onDelete,
}) => {
  // Línea de detalles: tipo + las propiedades que vengan rellenas
  const detalles: string[] = [herramienta.tipo];
  const props = herramienta.propiedades;
  if (props.grosor) {
    detalles.push(`${props.grosor}mm`);
  }
  if (props.numero) {
    detalles.push(`nº${props.numero}`);
  }
  if (props.diametro) {
    detalles.push(`⌀${props.diametro}cm`);
  }
  if (herramienta.cantidad > 1) {
    detalles.push(`x${herramienta.cantidad}`);
  }

  return (
    <View style={styles.card}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>🔧</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={1}>{herramienta.nombre}</Text>
        <Text style={styles.detalles} numberOfLines={1}>
          {detalles.join(" · ")}
        </Text>
      </View>

      <View style={styles.actions}>
        {herramienta.urlCompra && (
          <TouchableOpacity
            onPress={() => Linking.openURL(herramienta.urlCompra!)}
            style={[styles.actionBtn, styles.buyBtn]}
          >
            <Text style={styles.buyText}>🔗</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
          <Text style={styles.actionText}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
          <Text style={[styles.actionText, styles.deleteText]}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  emojiContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgWarm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  emoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  nombre: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  detalles: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgWarm,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 16,
    color: COLORS.textMid,
  },
  deleteText: {
    color: COLORS.danger,
  },
  buyBtn: {
    backgroundColor: COLORS.green,
  },
  buyText: {
    fontSize: 14,
  },
});
