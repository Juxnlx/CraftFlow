import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { observer } from "mobx-react-lite";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ExploreStackParamList } from "../../../presentation/navigation/MainNavigator";
import { auth } from "../../../config/firebaseConfig";
import { proyectoVM, favoritoVM } from "../../../presentation/viewmodels";
import { ProjectCard } from "../../../presentation/components/cards/ProjectCard";
import { LoadingSpinner } from "../../../presentation/components/common/LoadingSpinner";
import { FadeInItem } from "../../../presentation/components/common/FadeInItem";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";
import { mezclar } from "../../../utils/array";

/** Props inyectadas por React Navigation a la pantalla de Explorar */
type ExploreScreenProps = {
  navigation: NativeStackNavigationProp<ExploreStackParamList, "ExploreMain">;
};

/**
 * Filtros rápidos por categoría. El `emoji` acompaña al label y el `match`
 * es lo que se compara (en minúsculas) contra las etiquetas del proyecto.
 */
const FILTROS: { key: string; label: string; emoji: string; match: string }[] = [
  { key: "Todos", label: "Todos", emoji: "✨", match: "" },
  { key: "Crochet", label: "Crochet", emoji: "🧶", match: "crochet" },
  { key: "Cerámica", label: "Cerámica", emoji: "🏺", match: "cerámica" },
  { key: "Pintura", label: "Pintura", emoji: "🎨", match: "pintura" },
  { key: "Costura", label: "Costura", emoji: "🧵", match: "costura" },
  { key: "Papel", label: "Papel", emoji: "📄", match: "papel" },
];

/**
 * Pantalla de Explorar con búsqueda y filtros por categoría. Muestra los
 * proyectos públicos (excluyendo los propios) en un grid de 2 columnas.
 */
export const ExploreScreen = observer(({ navigation }: ExploreScreenProps) => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("Todos");
  // Cambia cada vez que la pantalla recibe foco: dispara un nuevo orden aleatorio
  const [shuffleSeed, setShuffleSeed] = useState(0);
  // Estado del pull-to-refresh para mostrar el spinner mientras refresca.
  const [refreshing, setRefreshing] = useState(false);
  const userId = auth.currentUser?.uid || "";

  // Recarga proyectos públicos y dispara un nuevo orden aleatorio.
  // Se usa tanto desde el pull-to-refresh como cuando la pantalla recibe foco.
  const refrescarProyectos = useCallback(async () => {
    setRefreshing(true);
    try {
      await proyectoVM.cargarProyectosPublicos();
      setShuffleSeed((s) => s + 1);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    proyectoVM.cargarProyectosPublicos();
  }, []);

  // Cada vez que el usuario entra a la pestaña, generamos un seed nuevo
  // para forzar que el useMemo de abajo recalcule el orden aleatorio.
  useFocusEffect(
    useCallback(() => {
      setShuffleSeed((s) => s + 1);
    }, [])
  );

  /** Actualiza el texto local y dispara la búsqueda en el ViewModel. */
  const handleBuscar = (texto: string) => {
    setBusqueda(texto);
    proyectoVM.buscarProyectos(texto);
  };

  // Determinar qué lista mostrar (excluyendo mis propios proyectos)
  const proyectosBase = busqueda.trim()
    ? proyectoVM.resultadosBusqueda
    : proyectoVM.proyectosPublicos;

  // Mezclar el listado para que cada visita a Explorar muestre un orden distinto.
  // Solo se recalcula al cambiar la lista, la búsqueda o el seed (focus).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const proyectosMezclados = useMemo(
    () => mezclar(proyectosBase),
    [proyectosBase, busqueda, shuffleSeed]
  );

  // Si aún no hay userId (auth en transición), no mostrar nada para evitar
  // que el usuario vea sus propios proyectos como "de otros usuarios".
  const proyectos = userId
    ? proyectosMezclados.filter((p) => p.idUsuario !== userId)
    : [];

  // Filtrar por categoría si no es "Todos"
  const filtroObj = FILTROS.find((f) => f.key === filtroActivo);
  const proyectosFiltrados =
    !filtroObj || filtroObj.match === ""
      ? proyectos
      : proyectos.filter((p) =>
          p.etiquetas.some((et) =>
            et.toLowerCase().includes(filtroObj.match.toLowerCase())
          )
        );

  const hayBusquedaActiva = busqueda.trim().length > 0;
  const hayFiltroActivo = filtroActivo !== "Todos";
  const mostrarContador = hayBusquedaActiva || hayFiltroActivo;

  if (proyectoVM.isLoading && proyectoVM.proyectosPublicos.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Cabecera ─── */}
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
        <Text style={styles.subtitle}>Descubre proyectos de la comunidad</Text>
      </View>

      {/* ─── Barra de búsqueda con icono ─── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar proyectos..."
            placeholderTextColor={COLORS.textLight}
            value={busqueda}
            onChangeText={handleBuscar}
          />
        </View>
      </View>

      {/* ─── Filtros ─── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosWrapper}
        contentContainerStyle={styles.filtros}
      >
        {FILTROS.map((f) => {
          const activo = filtroActivo === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filtro, activo && styles.filtroActivo]}
              onPress={() => setFiltroActivo(f.key)}
              activeOpacity={0.85}
            >
              <Text style={styles.filtroEmoji}>{f.emoji}</Text>
              <Text
                style={[styles.filtroText, activo && styles.filtroTextActivo]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ─── Contador de resultados ─── */}
      {mostrarContador && (
        <Text style={styles.contadorResultados}>
          {proyectosFiltrados.length} proyecto
          {proyectosFiltrados.length !== 1 ? "s" : ""} encontrado
          {proyectosFiltrados.length !== 1 ? "s" : ""}
        </Text>
      )}

      {/* ─── Grid de proyectos ─── */}
      <FlatList
        key={filtroActivo}
        data={proyectosFiltrados}
        numColumns={2}
        keyExtractor={(item) => item.id}
        extraData={favoritoVM.favoritosIds}
        style={styles.list}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refrescarProyectos}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        renderItem={({ item, index }) => (
          // Wrapper con maxWidth 50% para que la tarjeta mantenga el mismo
          // tamaño aunque la fila tenga un solo elemento (categorías con
          // pocos resultados o número impar). Sin esto, el flex:1 de
          // ProjectCard.cardCompact estira la tarjeta al 100% del ancho.
          <View style={styles.cell}>
            <FadeInItem index={index}>
              <ProjectCard
                proyecto={item}
                compact
                nombreAutor={proyectoVM.nombresAutores[item.idUsuario]}
                esFavorito={favoritoVM.esFavorito(item.id)}
                onPress={() =>
                  navigation.navigate("ProjectDetail", { idProyecto: item.id })
                }
                onToggleFavorito={() =>
                  favoritoVM.toggleFavorito(userId, item.id)
                }
              />
            </FadeInItem>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {hayBusquedaActiva ? "🔍" : "🎨"}
            </Text>
            <Text style={styles.emptyTitle}>
              {hayBusquedaActiva
                ? "No hay resultados"
                : hayFiltroActivo
                ? "Nada en esta categoría"
                : "Aún no hay proyectos"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {hayBusquedaActiva
                ? `No encontramos proyectos con "${busqueda.trim()}". Prueba con otros términos.`
                : hayFiltroActivo
                ? "Prueba con otra categoría o quita el filtro"
                : "Sé el primero en publicar un proyecto en la comunidad"}
            </Text>
          </View>
        }
      />
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
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  // Barra de búsqueda con icono
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  searchIcon: {
    fontSize: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    fontSize: 15,
    color: COLORS.text,
  },
  // Filtros
  filtrosWrapper: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: SPACING.sm,
  },
  filtros: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  filtro: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 6,
  },
  filtroActivo: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filtroEmoji: {
    fontSize: 13,
  },
  filtroText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMid,
  },
  filtroTextActivo: {
    color: COLORS.white,
  },
  // Contador
  contadorResultados: {
    fontSize: 12,
    color: COLORS.textLight,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    fontWeight: "600",
  },
  // Grid
  list: {
    flex: 1,
  },
  grid: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  row: {
    justifyContent: "flex-start",
  },
  cell: {
    flex: 1,
    maxWidth: "50%" as any,
  },
  // Estado vacío
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
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
});
