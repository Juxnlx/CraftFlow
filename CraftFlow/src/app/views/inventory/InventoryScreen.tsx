import React, { useEffect } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { observer } from "mobx-react-lite";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { InventoryStackParamList } from "../../../presentation/navigation/MainNavigator";
import { auth } from "../../../config/firebaseConfig";
import { materialVM, herramientaVM } from "../../../presentation/viewmodels";
import { MaterialCard } from "../../../presentation/components/cards/MaterialCard";
import { HerramientaCard } from "../../../presentation/components/cards/HerramientaCard";
import { LoadingSpinner } from "../../../presentation/components/common/LoadingSpinner";
import { Button } from "../../../presentation/components/common/Button";
import { FadeInItem } from "../../../presentation/components/common/FadeInItem";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";

/** Props inyectadas por React Navigation a la pantalla de inventario */
type InventoryScreenProps = {
  navigation: NativeStackNavigationProp<InventoryStackParamList, "InventoryMain">;
};

// Emoji y label de cada categoría, separados para poder pintarlos con
// estilos distintos (emoji pequeño + título en mayúsculas).
const CATEGORIA_EMOJIS: Record<string, string> = {
  lana: "🧶",
  pintura: "🎨",
  ceramica: "🏺",
  tela: "🧵",
  papel: "📄",
};

const CATEGORIA_LABELS: Record<string, string> = {
  lana: "Lana / Hilo",
  pintura: "Pintura",
  ceramica: "Cerámica",
  tela: "Tela / Tejido",
  papel: "Papel / Cartón",
};

/** Sección de la SectionList: agrupa materiales o herramientas */
interface Seccion {
  /** Emoji que precede al título de la sección */
  emoji: string;
  /** Nombre legible de la sección */
  titulo: string;
  /** Ítems que pertenecen a la sección */
  data: any[];
  /** Indica qué tarjeta usar al renderizar cada ítem */
  tipo: "material" | "herramienta";
}

/**
 * Pantalla de inventario con materiales y herramientas agrupados por sección.
 * Muestra cabecera con resumen de inventario (stats), tarjeta de valor si
 * existen precios, y lista con emoji + título de sección en mayúsculas.
 */
export const InventoryScreen = observer(
  ({ navigation }: InventoryScreenProps) => {
    const userId = auth.currentUser?.uid || "";

    useEffect(() => {
      if (userId) {
        materialVM.cargarMateriales(userId);
        herramientaVM.cargarHerramientas(userId);
      }
    }, [userId]);

    const isLoading = materialVM.isLoading || herramientaVM.isLoading;
    const totalMateriales = materialVM.materiales.length;
    const totalHerramientas = herramientaVM.herramientas.length;
    const totalItems = totalMateriales + totalHerramientas;
    const isEmpty = totalItems === 0;

    // Valor total del inventario (suma de precios de materiales que lo tengan)
    const valorTotal = materialVM.materiales.reduce(
      (sum, m) => sum + (m.precio ?? 0),
      0
    );
    const hayValor = valorTotal > 0;

    // Cantidad de materiales con enlace de compra guardado
    const conEnlace = materialVM.materiales.filter((m) => !!m.urlCompra).length;

    // Construir secciones para SectionList
    const sections: Seccion[] = [];
    const porCategoria = materialVM.materialesPorCategoria;
    let numCategorias = 0;
    for (const [cat, items] of Object.entries(porCategoria)) {
      if (items.length > 0) {
        numCategorias++;
        sections.push({
          emoji: CATEGORIA_EMOJIS[cat] || "📦",
          titulo: CATEGORIA_LABELS[cat] || cat,
          data: items,
          tipo: "material",
        });
      }
    }
    if (totalHerramientas > 0) {
      numCategorias++;
      sections.push({
        emoji: "🔧",
        titulo: "Herramientas",
        data: herramientaVM.herramientas,
        tipo: "herramienta",
      });
    }

    /** Pide confirmación y elimina un material del inventario. */
    const handleDeleteMaterial = (id: string, nombre: string) => {
      Alert.alert(
        "Eliminar material",
        `¿Seguro que quieres eliminar "${nombre}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => materialVM.eliminarMaterial(id),
          },
        ]
      );
    };

    /** Pide confirmación y elimina una herramienta del inventario. */
    const handleDeleteHerramienta = (id: string, nombre: string) => {
      Alert.alert(
        "Eliminar herramienta",
        `¿Seguro que quieres eliminar "${nombre}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => herramientaVM.eliminarHerramienta(id),
          },
        ]
      );
    };

    if (isLoading && isEmpty) {
      return <LoadingSpinner />;
    }

    return (
      <SafeAreaView style={styles.container}>
        {/* ─── Cabecera ─── */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Mi inventario</Text>
            {!isEmpty && (
              <Text style={styles.headerSubtitle}>
                {totalItems} ítem{totalItems !== 1 ? "s" : ""} ·{" "}
                {numCategorias} categoría
                {numCategorias !== 1 ? "s" : ""}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddEditMaterial", {})}
            activeOpacity={0.85}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Estado vacío ─── */}
        {isEmpty && !isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Tu inventario está vacío</Text>
            <Text style={styles.emptySubtitle}>
              ¡Añade materiales y herramientas para descubrir qué proyectos
              puedes hacer!
            </Text>
            <Button
              title="Añadir primer material"
              onPress={() => navigation.navigate("AddEditMaterial", {})}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            stickySectionHeadersEnabled={false}
            ListHeaderComponent={
              /* ─── Tarjeta de resumen del inventario ─── */
              <View style={styles.resumenCard}>
                <View style={styles.resumenStat}>
                  <Text style={styles.resumenNumero}>{totalMateriales}</Text>
                  <Text style={styles.resumenLabel}>
                    material{totalMateriales !== 1 ? "es" : ""}
                  </Text>
                </View>
                <View style={styles.resumenDivisor} />
                <View style={styles.resumenStat}>
                  <Text style={styles.resumenNumero}>{totalHerramientas}</Text>
                  <Text style={styles.resumenLabel}>
                    herramienta{totalHerramientas !== 1 ? "s" : ""}
                  </Text>
                </View>
                {hayValor && (
                  <>
                    <View style={styles.resumenDivisor} />
                    <View style={styles.resumenStat}>
                      <Text style={styles.resumenNumero}>
                        {valorTotal.toFixed(0)}€
                      </Text>
                      <Text style={styles.resumenLabel}>valor total</Text>
                    </View>
                  </>
                )}
              </View>
            }
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                <Text style={styles.sectionHeader}>{section.titulo}</Text>
                <View style={styles.sectionCountBadge}>
                  <Text style={styles.sectionCountText}>
                    {section.data.length}
                  </Text>
                </View>
              </View>
            )}
            renderItem={({ item, section, index }) => {
              if (section.tipo === "herramienta") {
                return (
                  <FadeInItem index={index}>
                    <HerramientaCard
                      herramienta={item}
                      onEdit={() =>
                        navigation.navigate("AddEditMaterial", {
                          idEditar: item.id,
                        })
                      }
                      onDelete={() =>
                        handleDeleteHerramienta(item.id, item.nombre)
                      }
                    />
                  </FadeInItem>
                );
              }
              return (
                <FadeInItem index={index}>
                  <MaterialCard
                    material={item}
                    onEdit={() =>
                      navigation.navigate("AddEditMaterial", {
                        idEditar: item.id,
                      })
                    }
                    onDelete={() => handleDeleteMaterial(item.id, item.nombre)}
                  />
                </FadeInItem>
              );
            }}
            ListFooterComponent={
              conEnlace > 0 ? (
                <Text style={styles.footerInfo}>
                  🔗 {conEnlace} material
                  {conEnlace !== 1 ? "es" : ""} con enlace de compra guardado
                </Text>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  // Cabecera
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "600",
    lineHeight: 28,
  },
  // Estado vacío
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
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
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    width: "80%" as any,
  },
  // Tarjeta de resumen (nueva)
  resumenCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  resumenStat: {
    flex: 1,
    alignItems: "center",
  },
  resumenNumero: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  resumenLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
  },
  resumenDivisor: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.borderLight,
  },
  // Lista
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  sectionEmoji: {
    fontSize: 14,
  },
  sectionHeader: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMid,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionCountBadge: {
    backgroundColor: COLORS.bgWarm,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    minWidth: 26,
    alignItems: "center",
  },
  sectionCountText: {
    color: COLORS.textMid,
    fontWeight: "700",
    fontSize: 12,
  },
  // Footer informativo
  footerInfo: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: SPACING.lg,
    fontStyle: "italic",
  },
});
