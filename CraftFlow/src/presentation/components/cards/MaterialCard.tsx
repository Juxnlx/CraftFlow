import React from "react";
import { View, Text, TouchableOpacity, Linking, StyleSheet } from "react-native";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";
import { Material } from "../../../domain/entities/Material";

/** Props de la tarjeta de material */
interface MaterialCardProps {
  /** Material a mostrar en la tarjeta */
  material: Material;
  /** Acción al pulsar el botón de editar */
  onEdit: () => void;
  /** Acción al pulsar el botón de eliminar */
  onDelete: () => void;
}

/**
 * Tarjeta de material en el inventario. Muestra nombre, categoría, color
 * y las propiedades relevantes según la categoría (metros, mililitros…).
 */
export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onEdit,
  onDelete,
}) => {
  // Construir la línea de detalles solo con los campos que vienen rellenos
  const detalles: string[] = [];
  if (material.color) {
    detalles.push(material.color);
  }
  const props = material.propiedades;
  if (props.metros) {
    detalles.push(`${props.metros}m`);
  }
  if (props.grosor) {
    detalles.push(`${props.grosor}mm`);
  }
  if (props.mililitros) {
    detalles.push(`${props.mililitros}ml`);
  }
  if (props.kilogramos) {
    detalles.push(`${props.kilogramos}kg`);
  }
  if (props.unidades) {
    detalles.push(`${props.unidades} uds`);
  }
  if (props.tipoMaterial) {
    detalles.push(String(props.tipoMaterial));
  }

  /** Emoji que representa visualmente cada categoría */
  const categoriaEmoji: Record<string, string> = {
    lana: "🧶",
    pintura: "🎨",
    ceramica: "🏺",
    tela: "🧵",
    papel: "📄",
  };

  return (
    <View style={styles.card}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{categoriaEmoji[material.categoria] || "📦"}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.nombreRow}>
          <Text style={styles.nombre} numberOfLines={1}>
            {material.nombre}
          </Text>
          {material.cantidad > 1 && (
            <Text style={styles.cantidadBadge}>×{material.cantidad}</Text>
          )}
        </View>
        <Text style={styles.detalles} numberOfLines={1}>
          {detalles.join(" · ") || material.categoria}
        </Text>
        {material.precio !== null && (
          <Text style={styles.precio}>{material.precio.toFixed(2)} €</Text>
        )}
      </View>

      <View style={styles.actions}>
        {material.urlCompra && (
          <TouchableOpacity
            onPress={() => Linking.openURL(material.urlCompra!)}
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
  nombreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  nombre: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    flexShrink: 1,
  },
  cantidadBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
    backgroundColor: COLORS.bgWarm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  detalles: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  precio: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
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
