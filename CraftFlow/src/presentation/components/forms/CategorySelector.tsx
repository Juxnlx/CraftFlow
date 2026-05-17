import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";
import { CategoriaType } from "../../../domain/entities/Material";

/** Props del selector de categoría */
interface CategorySelectorProps {
  /** Categoría seleccionada actualmente, o null si no hay ninguna */
  selectedCategory: CategoriaType | null;
  /** Callback que recibe la nueva categoría al pulsar un chip */
  onSelect: (category: CategoriaType) => void;
}

/** Lista de categorías soportadas con su emoji y etiqueta visible */
const CATEGORIAS: { key: CategoriaType; emoji: string; label: string }[] = [
  { key: "lana", emoji: "🧶", label: "Lana / Hilo" },
  { key: "pintura", emoji: "🎨", label: "Pintura" },
  { key: "ceramica", emoji: "🏺", label: "Cerámica" },
  { key: "tela", emoji: "🧵", label: "Tela / Tejido" },
  { key: "papel", emoji: "📄", label: "Papel / Cartón" },
];

/**
 * Selector de categoría de material con iconos emoji.
 * Al seleccionar una categoría, cambia a estilo activo (fondo primary).
 */
export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {CATEGORIAS.map((cat) => {
        const isSelected = selectedCategory === cat.key;
        return (
          <TouchableOpacity
            key={cat.key}
            style={[styles.item, isSelected && styles.itemSelected]}
            onPress={() => onSelect(cat.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  itemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMid,
  },
  labelSelected: {
    color: COLORS.white,
  },
});
