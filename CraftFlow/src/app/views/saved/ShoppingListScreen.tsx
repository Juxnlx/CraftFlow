import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { observer } from "mobx-react-lite";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SavedStackParamList } from "../../../presentation/navigation/MainNavigator";
import { auth } from "../../../config/firebaseConfig";
import { listaCompraVM } from "../../../presentation/viewmodels";
import { LoadingSpinner } from "../../../presentation/components/common/LoadingSpinner";
import { FadeInItem } from "../../../presentation/components/common/FadeInItem";
import { ItemCompra } from "../../../domain/entities/ItemCompra";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";

type ShoppingListScreenProps = {
  navigation: NativeStackNavigationProp<SavedStackParamList, "ShoppingList">;
};

// Iconos por categoría de material o tipo genérico de herramienta
const EMOJIS_CATEGORIA: Record<string, string> = {
  lana: "🧶",
  pintura: "🎨",
  ceramica: "🏺",
  tela: "🧵",
  papel: "📄",
};

// Convierte una categoría a un título legible con su primera letra en mayúscula
const formatearCategoria = (cat: string): string => {
  if (!cat) return "Otros";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

/**
 * Devuelve el emoji adecuado para un ítem.
 * Si es herramienta, siempre usa 🔧. Si es material, usa el emoji por categoría.
 */
const getEmoji = (item: ItemCompra): string => {
  if (item.esHerramienta) return "🔧";
  return EMOJIS_CATEGORIA[item.categoriaOTipo.toLowerCase()] || "📦";
};

/**
 * Pantalla de lista de la compra inteligente.
 * Muestra todos los materiales y herramientas que el usuario necesita
 * para completar sus proyectos guardados, agrupados por categoría.
 */
export const ShoppingListScreen = observer(
  ({ navigation }: ShoppingListScreenProps) => {
    const userId = auth.currentUser?.uid || "";

    // Recargar cada vez que la pantalla recibe foco. Así un favorito
    // recién marcado o un material recién añadido al inventario se
    // reflejan al instante al volver a entrar a la lista.
    useFocusEffect(
      useCallback(() => {
        if (userId) {
          listaCompraVM.cargarLista(userId);
        }
      }, [userId])
    );

    // Agrupar ítems por categoría/tipo para mostrarlos con headers de sección
    const grupos = useMemo(() => {
      const map = new Map<string, { titulo: string; items: ItemCompra[] }>();
      for (const item of listaCompraVM.items) {
        const clave = item.esHerramienta
          ? `h_${item.categoriaOTipo || "Sin tipo"}`
          : `m_${item.categoriaOTipo}`;
        const titulo = item.esHerramienta
          ? item.categoriaOTipo || "Herramientas"
          : formatearCategoria(item.categoriaOTipo);
        const existente = map.get(clave);
        if (existente) {
          existente.items.push(item);
        } else {
          map.set(clave, { titulo, items: [item] });
        }
      }
      return Array.from(map.values());
    }, [listaCompraVM.items]);

    if (listaCompraVM.isLoading) {
      return <LoadingSpinner />;
    }

    const total = listaCompraVM.totalItems;
    const totalMat = listaCompraVM.totalMateriales;
    const totalHer = listaCompraVM.totalHerramientas;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Lista de la compra</Text>
              <Text style={styles.subtitle}>
                Todo lo que te falta para tus proyectos
              </Text>
            </View>
          </View>

          {/* Tarjeta de resumen */}
          {total > 0 ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Te faltan {total} ítems</Text>
              <Text style={styles.summarySubtitle}>
                para completar tus proyectos guardados
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{totalMat}</Text>
                  <Text style={styles.statLabel}>
                    material{totalMat !== 1 ? "es" : ""}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{totalHer}</Text>
                  <Text style={styles.statLabel}>
                    herramienta{totalHer !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyTitle}>
                ¡Tienes todo lo que necesitas!
              </Text>
              <Text style={styles.emptySubtitle}>
                Puedes empezar a hacer cualquier proyecto guardado ahora mismo
              </Text>
            </View>
          )}

          {/* Grupos de ítems */}
          {grupos.map((grupo, i) => (
            <View key={i} style={styles.grupoContainer}>
              <Text style={styles.grupoTitulo}>{grupo.titulo}</Text>
              {grupo.items.map((item, j) => (
                <FadeInItem key={j} index={j}>
                  <View
                    style={[
                      styles.itemCard,
                      listaCompraVM.estaComprado(item.clave) &&
                        styles.itemCardComprado,
                    ]}
                  >
                    {/* Checkbox para marcar como comprado */}
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        listaCompraVM.estaComprado(item.clave) &&
                          styles.checkboxMarcado,
                      ]}
                      onPress={() => listaCompraVM.toggleItemComprado(item.clave)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.85}
                    >
                      {listaCompraVM.estaComprado(item.clave) && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={COLORS.white}
                        />
                      )}
                    </TouchableOpacity>
                    <View style={styles.itemEmoji}>
                      <Text style={styles.itemEmojiText}>{getEmoji(item)}</Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text
                        style={[
                          styles.itemNombre,
                          listaCompraVM.estaComprado(item.clave) &&
                            styles.itemNombreTachado,
                        ]}
                        numberOfLines={1}
                      >
                        {item.nombre}
                      </Text>
                      {/* Chips con los proyectos que necesitan este ítem */}
                      <View style={styles.proyectosChips}>
                        {item.proyectosQueLoNecesitan.map((nombreProy, k) => (
                          <View key={k} style={styles.chipProyecto}>
                            <Text
                              style={styles.chipProyectoText}
                              numberOfLines={1}
                            >
                              {nombreProy}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    {/* Botón de compra si hay URL sugerida */}
                    {item.urlCompraSugerida && (
                      <TouchableOpacity
                        style={styles.buyButton}
                        onPress={() =>
                          Linking.openURL(item.urlCompraSugerida!)
                        }
                        activeOpacity={0.85}
                      >
                        <Ionicons
                          name="cart-outline"
                          size={20}
                          color={COLORS.white}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </FadeInItem>
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    padding: SPACING.md,
    paddingTop: SPACING.xl + 16,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  // Estado vacío (cuando tienes todo)
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
  // Tarjeta de resumen
  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.white,
  },
  summarySubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: SPACING.xs,
  },
  // Grupos por categoría
  grupoContainer: {
    marginBottom: SPACING.md,
  },
  grupoTitulo: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMid,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  // Tarjeta de ítem
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  itemEmoji: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgWarm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  itemEmojiText: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemCardComprado: {
    opacity: 0.55,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  checkboxMarcado: {
    backgroundColor: COLORS.primary,
  },
  itemNombre: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  itemNombreTachado: {
    textDecorationLine: "line-through",
    color: COLORS.textLight,
  },
  proyectosChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  chipProyecto: {
    backgroundColor: COLORS.bgWarm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    maxWidth: 160,
  },
  chipProyectoText: {
    fontSize: 11,
    color: COLORS.textMid,
    fontWeight: "600",
  },
  buyButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.green,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.sm,
  },
  buyButtonText: {
    fontSize: 18,
  },
});
