import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { observer } from "mobx-react-lite";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { SavedStackParamList } from "../../../presentation/navigation/MainNavigator";
import { auth } from "../../../config/firebaseConfig";
import {
  favoritoVM,
  proyectoVM,
  recomendacionVM,
  materialVM,
  herramientaVM,
} from "../../../presentation/viewmodels";
import { ProjectCard } from "../../../presentation/components/cards/ProjectCard";
import { LoadingSpinner } from "../../../presentation/components/common/LoadingSpinner";
import { FadeInItem } from "../../../presentation/components/common/FadeInItem";
import { Proyecto } from "../../../domain/entities/Proyecto";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";

type SavedScreenProps = {
  navigation: NativeStackNavigationProp<SavedStackParamList, "SavedMain">;
};

/**
 * Pantalla de proyectos guardados como favoritos.
 * Carga los favoritos y luego obtiene el proyecto completo de cada uno.
 */
export const SavedScreen = observer(({ navigation }: SavedScreenProps) => {
  const userId = auth.currentUser?.uid || "";
  const [proyectosGuardados, setProyectosGuardados] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const cargar = async () => {
        if (!userId) return;
        setCargando(true);
        // Refrescamos también inventario y recomendaciones porque la card
        // del proyecto y el detalle leen de ahí. Si el usuario cambia el
        // inventario y vuelve aquí sin pasar por Home, queremos que el
        // matchPercent y los ✓/✗ del detalle estén al día.
        await Promise.all([
          favoritoVM.cargarFavoritos(userId),
          materialVM.cargarMateriales(userId),
          herramientaVM.cargarHerramientas(userId),
          recomendacionVM.cargarRecomendaciones(userId),
        ]);

        const ids = favoritoVM.favoritos.map((f) => f.idProyecto);
        const proyectos = await proyectoVM.cargarProyectosPorIds(ids);
        setProyectosGuardados(proyectos);
        setCargando(false);
      };

      cargar();
    }, [userId])
  );

  if (cargando) {
    return <LoadingSpinner />;
  }

  // Filtrar dinámicamente por los favoritos actuales: cuando el usuario quita
  // un proyecto del corazón, desaparece al instante de la lista sin esperar
  // a salir y volver. La carga inicial sigue siendo el snapshot de Firebase.
  const proyectosVisibles = proyectosGuardados.filter((p) =>
    favoritoVM.favoritosIds.has(p.id)
  );
  const total = proyectosVisibles.length;
  const isEmpty = total === 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Cabecera ─── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Guardados</Text>
            {total > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{total}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>Tu lista de inspiración</Text>
        </View>
      </View>

      {/* ─── Estado vacío personalizado ─── */}
      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>♡</Text>
          <Text style={styles.emptyTitle}>Aún no has guardado proyectos</Text>
          <Text style={styles.emptySubtitle}>
            Explora proyectos de la comunidad y pulsa el corazón para
            guardarlos aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={proyectosVisibles}
          keyExtractor={(item) => item.id}
          extraData={favoritoVM.favoritosIds}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              {/* Botón destacado para ir a la lista de la compra */}
              <TouchableOpacity
                style={styles.shoppingButton}
                onPress={() => navigation.navigate("ShoppingList")}
                activeOpacity={0.85}
              >
                <View style={styles.shoppingIconBox}>
                  <Text style={styles.shoppingIcon}>🛒</Text>
                </View>
                <View style={styles.shoppingTextBox}>
                  <Text style={styles.shoppingTitle}>Lista de la compra</Text>
                  <Text style={styles.shoppingSubtitle}>
                    Descubre qué te falta para hacer tus proyectos
                  </Text>
                </View>
                <Text style={styles.shoppingArrow}>→</Text>
              </TouchableOpacity>

              {/* Encabezado de sección */}
              <Text style={styles.sectionHeader}>Tus proyectos</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <FadeInItem index={index}>
              <ProjectCard
                proyecto={item}
                esFavorito={favoritoVM.esFavorito(item.id)}
                onPress={() =>
                  navigation.navigate("ProjectDetail", { idProyecto: item.id })
                }
                onToggleFavorito={() =>
                  favoritoVM.toggleFavorito(userId, item.id)
                }
              />
            </FadeInItem>
          )}
        />
      )}
    </SafeAreaView>
  );
});

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
    paddingTop: SPACING.xl + 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.bgWarm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    minWidth: 32,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textMid,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  // Estado vacío
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 72,
    color: COLORS.accent,
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
    paddingHorizontal: SPACING.md,
  },
  // Lista
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  // Botón destacado a la lista de la compra
  shoppingButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
  },
  shoppingIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  shoppingIcon: {
    fontSize: 22,
  },
  shoppingTextBox: {
    flex: 1,
  },
  shoppingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.white,
  },
  shoppingSubtitle: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: 2,
  },
  shoppingArrow: {
    fontSize: 22,
    color: COLORS.white,
    fontWeight: "600",
  },
  // Encabezado de sección estilo iOS
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMid,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
});
