import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { observer } from "mobx-react-lite";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { HomeStackParamList } from "../../../presentation/navigation/MainNavigator";
import { auth } from "../../../config/firebaseConfig";
import {
  recomendacionVM,
  materialVM,
  herramientaVM,
  favoritoVM,
  proyectoVM,
  usuarioVM,
  proyectoEnProgresoVM,
} from "../../../presentation/viewmodels";
import { Proyecto } from "../../../domain/entities/Proyecto";
import { ProjectCard } from "../../../presentation/components/cards/ProjectCard";
import { LoadingSpinner } from "../../../presentation/components/common/LoadingSpinner";
import { EmptyState } from "../../../presentation/components/common/EmptyState";
import { FadeInItem } from "../../../presentation/components/common/FadeInItem";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, "HomeMain">;
};

/**
 * Devuelve un saludo apropiado según la hora del día.
 */
const construirSaludo = (): { texto: string; emoji: string } => {
  const hora = new Date().getHours();
  if (hora < 12) return { texto: "Buenos días", emoji: "☀️" };
  if (hora < 20) return { texto: "Buenas tardes", emoji: "🌤" };
  return { texto: "Buenas noches", emoji: "🌙" };
};

/**
 * Formatea la fecha actual en español de forma humana.
 * Ej: "lunes, 23 de abril"
 */
const formatearFechaActual = (): string => {
  try {
    return new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return "";
  }
};

// Mezcla un array sin mutar el original (Fisher-Yates).
// Se usa para que las recomendaciones empatadas no salgan siempre en el mismo orden.
function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Etiquetas cortas usadas en los chips de inventario del hero verde
const LABELS_CATEGORIA: Record<string, string> = {
  lana: "hilo",
  pintura: "pintura",
  ceramica: "cerámica",
  tela: "tela",
  papel: "papel",
};

/**
 * Pantalla principal "¿Qué puedo hacer hoy?"
 * Dashboard con saludo personalizado, inventario en números, último proyecto
 * y recomendaciones basadas en el inventario del usuario.
 */
export const HomeScreen = observer(({ navigation }: HomeScreenProps) => {
  const userId = auth.currentUser?.uid || "";
  const usuario = usuarioVM.usuarioActual;
  const saludo = useMemo(() => construirSaludo(), []);
  const fecha = useMemo(() => formatearFechaActual(), []);

  // Cache local de los proyectos asociados a los seguimientos en curso.
  const [proyectosEnCurso, setProyectosEnCurso] = useState<
    Record<string, Proyecto>
  >({});

  // Cambia al pulsar el botón de recargar recomendaciones; se usa para
  // recalcular el orden aleatorio dentro del mismo matchPercent.
  const [shuffleSeed, setShuffleSeed] = useState(0);

  useEffect(() => {
    if (userId) {
      usuarioVM.cargarUsuario(userId);
      recomendacionVM.cargarRecomendaciones(userId);
      materialVM.cargarMateriales(userId);
      herramientaVM.cargarHerramientas(userId);
      favoritoVM.cargarFavoritos(userId);
      proyectoVM.cargarMisProyectos(userId);
      proyectoEnProgresoVM.cargarMisProyectosEnProgreso(userId);
    }
  }, [userId]);

  // Cada vez que el Home recibe foco refrescamos inventario, herramientas,
  // recomendaciones y seguimientos. Así un material añadido o eliminado en
  // Inventario o un proyecto recién empezado se reflejan al instante.
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        materialVM.cargarMateriales(userId);
        herramientaVM.cargarHerramientas(userId);
        recomendacionVM.cargarRecomendaciones(userId);
        proyectoEnProgresoVM.cargarMisProyectosEnProgreso(userId);
      }
    }, [userId])
  );

  // Cuando cambian los seguimientos, cargar los Proyectos asociados.
  useEffect(() => {
    const ids = proyectoEnProgresoVM.proyectosEnProgreso.map((s) => s.idProyecto);
    if (ids.length === 0) {
      setProyectosEnCurso({});
      return;
    }
    proyectoVM.cargarProyectosPorIds(ids).then((proys) => {
      const map: Record<string, Proyecto> = {};
      proys.forEach((p) => (map[p.id] = p));
      setProyectosEnCurso(map);
    });
  }, [proyectoEnProgresoVM.proyectosEnProgreso]);

  const handleAbandonar = (idSeguimiento: string, nombre: string) => {
    Alert.alert(
      "Abandonar proyecto",
      `¿Seguro que quieres abandonar "${nombre}"? Se perderá el progreso registrado.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Abandonar",
          style: "destructive",
          onPress: () => proyectoEnProgresoVM.abandonarProyecto(idSeguimiento),
        },
      ]
    );
  };

  // Recomendaciones: filtramos las que aportan 0% (con inventario vacío
  // no tiene sentido mostrar proyectos a los que no aportas nada) y luego
  // mezclamos antes de ordenar para que los empates salgan en orden
  // distinto cada vez. El botón shuffle fuerza la reorganización.
  const recomendacionesOrdenadas = useMemo(() => {
    const conAporte = recomendacionVM.recomendaciones.filter(
      (r) => r.matchPercent > 0
    );
    const mezcladas = mezclar(conAporte);
    return mezcladas.sort((a, b) => b.matchPercent - a.matchPercent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recomendacionVM.recomendaciones, shuffleSeed]);

  // Lista ordenada por % completado descendente, emparejando seguimiento + proyecto.
  // Un proyecto al 100% sigue siendo "en proceso" hasta que el usuario pulse
  // "Guardar y completar" en RealizandoProyecto, por lo que se incluye igualmente.
  const sigueTrabajando = useMemo(() => {
    return proyectoEnProgresoVM.proyectosEnProgreso
      .map((s) => ({ seguimiento: s, proyecto: proyectosEnCurso[s.idProyecto] }))
      .filter((x) => x.proyecto)
      .sort(
        (a, b) =>
          b.seguimiento.porcentajeCompletado - a.seguimiento.porcentajeCompletado
      );
  }, [proyectoEnProgresoVM.proyectosEnProgreso, proyectosEnCurso]);

  // Nombre a mostrar en el saludo (prioriza el del perfil actualizado)
  const nombreMostrar =
    usuario?.nombre?.split(" ")[0] ||
    auth.currentUser?.displayName?.split(" ")[0] ||
    "";

  const avatarUrl = usuario?.fotoPerfil || null;

  if (
    recomendacionVM.isLoading &&
    recomendacionVM.recomendaciones.length === 0
  ) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recomendacionesOrdenadas}
        keyExtractor={(item) => item.proyecto.id}
        extraData={favoritoVM.favoritosIds}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ─── Saludo personalizado ─── */}
            <View style={styles.saludoRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.saludoTexto}>
                  {saludo.emoji} {saludo.texto}
                </Text>
                {nombreMostrar ? (
                  <Text style={styles.saludoNombre}>{nombreMostrar}</Text>
                ) : null}
                {fecha ? <Text style={styles.saludoFecha}>{fecha}</Text> : null}
              </View>
              {/* Avatar real si existe, inicial como fallback */}
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {(nombreMostrar || "U").charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* ─── Hero card verde ─── */}
            <View style={styles.heroCard}>
              <Text style={styles.heroTitulo}>✨ Puedes hacer</Text>
              <Text style={styles.heroNumero}>
                {recomendacionVM.totalProyectosDisponibles} proyecto
                {recomendacionVM.totalProyectosDisponibles !== 1 ? "s" : ""}
              </Text>
              <Text style={styles.heroSubtitulo}>
                con tu inventario actual
              </Text>
              <View style={styles.heroChips}>
                {Object.entries(materialVM.materialesPorCategoria).map(
                  ([cat, items]) => {
                    if (items.length === 0) return null;
                    return (
                      <View key={cat} style={styles.heroChip}>
                        <Text style={styles.heroChipText}>
                          {items.length} {LABELS_CATEGORIA[cat] || cat}
                        </Text>
                      </View>
                    );
                  }
                )}
                {herramientaVM.herramientas.length > 0 && (
                  <View style={styles.heroChip}>
                    <Text style={styles.heroChipText}>
                      {herramientaVM.herramientas.length} herramientas
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* ─── Tu inventario en números ─── */}
            <Text style={styles.sectionTitleSmall}>Tu inventario</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🧶</Text>
                <Text style={styles.statNumero}>
                  {materialVM.materiales.length}
                </Text>
                <Text style={styles.statLabel}>
                  material{materialVM.materiales.length !== 1 ? "es" : ""}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🔧</Text>
                <Text style={styles.statNumero}>
                  {herramientaVM.herramientas.length}
                </Text>
                <Text style={styles.statLabel}>
                  herramienta
                  {herramientaVM.herramientas.length !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>📦</Text>
                <Text style={styles.statNumero}>
                  {proyectoVM.misProyectos.length}
                </Text>
                <Text style={styles.statLabel}>
                  {proyectoVM.misProyectos.length === 1
                    ? "proyecto"
                    : "proyectos"}
                </Text>
              </View>
            </View>

            {/* ─── Sigue trabajando (proyectos en curso, ordenados por % desc) ─── */}
            {/* Scroll horizontal: muestra ~3 cards a la vez y desliza para ver el resto. */}
            {sigueTrabajando.length > 0 && (
              <>
                <Text style={styles.sectionTitleSmall}>Sigue trabajando</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.continueScroll}
                >
                  {sigueTrabajando.map(({ seguimiento, proyecto }) => {
                    const pct = seguimiento.porcentajeCompletado;
                    return (
                      <TouchableOpacity
                        key={seguimiento.id}
                        style={styles.continueCardH}
                        onPress={() =>
                          navigation.navigate("ProjectDetail", {
                            idProyecto: proyecto.id,
                          })
                        }
                        activeOpacity={0.85}
                      >
                        {/* Botón abandonar superpuesto en la esquina */}
                        <TouchableOpacity
                          onPress={() =>
                            handleAbandonar(seguimiento.id, proyecto.nombre)
                          }
                          style={styles.abandonBtn}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.abandonBtnText}>✕</Text>
                        </TouchableOpacity>
                        {proyecto.imagen ? (
                          <Image
                            source={{ uri: proyecto.imagen }}
                            style={styles.continueImageH}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.continueEmojiBoxH}>
                            <Text style={styles.continueEmoji}>🎨</Text>
                          </View>
                        )}
                        <View style={styles.continueTextBoxH}>
                          <Text style={styles.continueLabel}>
                            {pct}% completado
                          </Text>
                          <Text style={styles.continueNombre} numberOfLines={1}>
                            {proyecto.nombre}
                          </Text>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                { width: `${pct}%` },
                              ]}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {/* ─── Para ti hoy ─── */}
            {recomendacionVM.recomendaciones.length > 0 && (
              <View style={styles.sectionHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Para ti hoy</Text>
                  <Text style={styles.sectionSubtitle}>
                    Basados en tu inventario actual
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShuffleSeed((s) => s + 1)}
                  style={styles.shuffleBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="shuffle"
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <FadeInItem index={index}>
            <ProjectCard
              proyecto={item.proyecto}
              nombreAutor={item.nombreAutor}
              matchPercent={item.matchPercent}
              canMake={item.canMake}
              esFavorito={favoritoVM.esFavorito(item.proyecto.id)}
              onPress={() =>
                navigation.navigate("ProjectDetail", {
                  idProyecto: item.proyecto.id,
                })
              }
              onToggleFavorito={() =>
                favoritoVM.toggleFavorito(userId, item.proyecto.id)
              }
            />
          </FadeInItem>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="🧶"
            title="Aún no hay recomendaciones"
            subtitle="Añade materiales a tu inventario para descubrir proyectos que puedes hacer"
          />
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
  list: {
    padding: SPACING.md,
    paddingTop: SPACING.xl + 16,
    paddingBottom: SPACING.xl,
  },

  // Saludo
  saludoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  saludoTexto: {
    fontSize: 14,
    color: COLORS.textMid,
    fontWeight: "600",
  },
  saludoNombre: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 2,
  },
  saludoFecha: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
    textTransform: "capitalize" as const,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 18,
  },

  // Hero verde
  heroCard: {
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  heroTitulo: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "700",
    opacity: 0.9,
    letterSpacing: 0.3,
  },
  heroNumero: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  heroSubtitulo: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    fontWeight: "500",
  },
  heroChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  heroChip: {
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  heroChipText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "600",
  },

  // Títulos de sección
  sectionTitleSmall: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMid,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  sectionHeader: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  shuffleBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgWarm,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },

  // Stats de inventario
  statsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: SPACING.xs,
  },
  statNumero: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "500",
    marginTop: 2,
  },

  // Sigue trabajando
  continueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.md,
  },
  continueImage: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
  },
  continueEmojiBox: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgWarm,
    justifyContent: "center",
    alignItems: "center",
  },
  continueEmoji: {
    fontSize: 28,
  },
  continueTextBox: {
    flex: 1,
  },
  continueLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  continueNombre: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 2,
  },
  continueCTA: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
    marginTop: SPACING.xs,
  },
  // Scroll horizontal de "Sigue trabajando"
  continueScroll: {
    paddingRight: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  continueCardH: {
    width: 230,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    position: "relative",
  },
  abandonBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  abandonBtnText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: "700",
    lineHeight: 16,
  },
  continueImageH: {
    width: "100%",
    height: 110,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  continueEmojiBoxH: {
    width: "100%",
    height: 110,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgWarm,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  continueTextBoxH: {
    width: "100%",
  },
  progressBar: {
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgWarm,
    marginTop: SPACING.xs,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
});
