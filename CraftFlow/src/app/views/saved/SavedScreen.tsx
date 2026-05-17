import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

/** Props inyectadas por React Navigation a la pantalla de guardados */
type SavedScreenProps = {
  navigation: NativeStackNavigationProp<SavedStackParamList, "SavedMain">;
};

/**
 * Pantalla de proyectos guardados como favoritos. Carga los favoritos
 * del usuario y luego pide el proyecto completo de cada uno para
 * mostrarlos como tarjetas.
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
        // También refrescamos inventario y recomendaciones para que el
        // matchPercent de las cards esté al día si el usuario llega aquí
        // sin pasar antes por Home.
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

  // Cruzamos los proyectos con el Set de favoritos para que, al quitar
  // un corazón, la tarjeta desaparezca de la lista sin recargar.
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
