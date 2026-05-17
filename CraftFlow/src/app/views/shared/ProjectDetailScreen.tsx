import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { observer } from "mobx-react-lite";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../../config/firebaseConfig";
import {
  proyectoVM,
  favoritoVM,
  recomendacionVM,
  proyectoEnProgresoVM,
} from "../../../presentation/viewmodels";
import { Button } from "../../../presentation/components/common/Button";
import { LoadingSpinner } from "../../../presentation/components/common/LoadingSpinner";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";

/** Props inyectadas por React Navigation a la pantalla de detalle de proyecto */
type ProjectDetailScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ ProjectDetail: { idProyecto: string } }, "ProjectDetail">;
};

/**
 * Pantalla de detalle de proyecto compartida entre todos los tabs. Muestra
 * la imagen con efecto parallax, info básica, mini tarjeta de match con
 * los materiales/herramientas que tiene el usuario, los pasos y acciones.
 */
export const ProjectDetailScreen = observer(
  ({ navigation, route }: ProjectDetailScreenProps) => {
    const { idProyecto } = route.params;
    const userId = auth.currentUser?.uid || "";
    const proyecto = proyectoVM.proyectoDetalle;

    // ─── Hooks siempre arriba (antes de cualquier return condicional) ───
    // Animaciones: scroll para parallax del hero, valor para la barra de progreso
    const scrollY = useRef(new Animated.Value(0)).current;
    const progressValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      proyectoVM.cargarProyectoDetalle(idProyecto);
      // Si el usuario ya empezó este proyecto, recuperamos el seguimiento
      // para mostrar "Continuar (X%)" en lugar de "Empezar".
      if (userId) {
        proyectoEnProgresoVM.cargarSeguimiento(userId, idProyecto);
      }
    }, [idProyecto, userId]);

    // Datos de recomendación (con null-safe, antes del early return para que
    // los hooks subsiguientes se llamen siempre en el mismo orden).
    const recomendacion = proyecto
      ? recomendacionVM.recomendaciones.find((r) => r.proyecto.id === proyecto.id)
      : undefined;

    // Resumen de match para la mini tarjeta de progreso
    const matsTotal = recomendacion?.materialesMatch.length ?? 0;
    const matsTenidos =
      recomendacion?.materialesMatch.filter((m) => m.loTieneElUsuario).length ??
      0;
    const hersTotal = recomendacion?.herramientasMatch.length ?? 0;
    const hersTenidas =
      recomendacion?.herramientasMatch.filter((h) => h.loTieneElUsuario)
        .length ?? 0;
    const totalItems = matsTotal + hersTotal;
    const itemsTenidos = matsTenidos + hersTenidas;
    const porcentaje = totalItems === 0 ? 0 : (itemsTenidos / totalItems) * 100;

    // Animar la barra de progreso desde 0 hasta el valor real cuando hay datos
    useEffect(() => {
      if (totalItems > 0) {
        progressValue.setValue(0);
        Animated.timing(progressValue, {
          toValue: porcentaje,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false, // width no soporta native driver
        }).start();
      }
    }, [porcentaje, totalItems]);

    // Parallax: la imagen hero crece cuando se hace pull-down y se desliza
    // hacia arriba al scrollear normalmente, dando sensación de profundidad.
    const heroTranslateY = scrollY.interpolate({
      inputRange: [-200, 0, 240],
      outputRange: [0, 0, -120],
      extrapolate: "clamp",
    });
    const heroScale = scrollY.interpolate({
      inputRange: [-200, 0, 240],
      outputRange: [1.5, 1, 1],
      extrapolate: "clamp",
    });

    // ─── Early return cuando aún no hay datos ───
    if (proyectoVM.isLoading || !proyecto) {
      return <LoadingSpinner />;
    }

    const esFav = favoritoVM.esFavorito(proyecto.id);
    const esPropio = proyecto.idUsuario === userId;
    const seguimientoActivo = proyectoEnProgresoVM.proyectoActivo;

    /** Crea el seguimiento si no existe y abre la pantalla de realización */
    const handleEmpezarOContinuar = async () => {
      // Si el proyecto no tiene pasos, no tiene sentido entrar al modo realización
      if (proyecto.pasos.length === 0) {
        Alert.alert(
          "Sin pasos definidos",
          "Este proyecto no tiene pasos descritos, así que no se puede seguir paso a paso."
        );
        return;
      }
      const seguimiento = await proyectoEnProgresoVM.iniciarProyecto(
        userId,
        proyecto.id,
        proyecto.pasos.length
      );
      if (seguimiento) {
        navigation.navigate("RealizandoProyecto", { idProyecto: proyecto.id });
      }
    };

    /** Pide confirmación y elimina el proyecto (solo para el autor). */
    const handleEliminar = () => {
      Alert.alert(
        "Eliminar proyecto",
        "¿Seguro que quieres eliminar este proyecto?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              await proyectoVM.eliminarProyecto(proyecto.id);
              navigation.goBack();
            },
          },
        ]
      );
    };

    return (
      <SafeAreaView style={styles.container}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* ─── Hero image con parallax ─── */}
          <Animated.View
            style={[
              styles.heroImage,
              {
                transform: [
                  { translateY: heroTranslateY },
                  { scale: heroScale },
                ],
              },
            ]}
          >
            {proyecto.imagen ? (
              <Image
                source={{ uri: proyecto.imagen }}
                style={styles.heroImageReal}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.heroEmoji}>🎨</Text>
            )}

            {recomendacion?.canMake && (
              <View style={styles.canMakeBadge}>
                <Text style={styles.canMakeText}>
                  ✓ Tienes todos los materiales
                </Text>
              </View>
            )}
          </Animated.View>

          {/* ─── Contenido principal ─── */}
          <View style={styles.content}>
            <Text style={styles.nombre}>{proyecto.nombre}</Text>

            <View style={styles.metaRow}>
              {proyecto.dificultad && (
                <View style={styles.chipDificultad}>
                  <Text style={styles.chipDificultadText}>
                    {proyecto.dificultad}
                  </Text>
                </View>
              )}
              <Text style={styles.visibilidad}>
                {proyecto.visibilidad === "publico" ? "🌍 Público" : "🔒 Privado"}
              </Text>
            </View>

            {/* Etiquetas */}
            {proyecto.etiquetas.length > 0 && (
              <View style={styles.etiquetasRow}>
                {proyecto.etiquetas.map((et, i) => (
                  <View key={i} style={styles.etiqueta}>
                    <Text style={styles.etiquetaText}>{et}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Mini tarjeta de match (solo si hay datos de recomendación
                y el proyecto no es del propio usuario) */}
            {!esPropio && recomendacion && totalItems > 0 && (
              <View style={styles.matchCard}>
                <View style={styles.matchHeader}>
                  <Text style={styles.matchTitle}>
                    Tienes {itemsTenidos} de {totalItems} ítems
                  </Text>
                  <Text style={styles.matchPercent}>
                    {Math.round(porcentaje)}%
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressValue.interpolate({
                          inputRange: [0, 100],
                          outputRange: ["0%", "100%"],
                          extrapolate: "clamp",
                        }),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.matchSub}>
                  {matsTenidos}/{matsTotal} materiales · {hersTenidas}/
                  {hersTotal} herramientas
                </Text>
              </View>
            )}

            {/* ─── Descripción ─── */}
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.descripcion}>{proyecto.descripcion}</Text>

            {/* ─── Materiales ─── */}
            {proyecto.materiales.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Materiales necesarios</Text>
                {proyecto.materiales.map((mat, i) => {
                  const matchData = recomendacion?.materialesMatch.find(
                    (m) => m.nombre === mat.nombre
                  );
                  const loTiene = matchData?.loTieneElUsuario;
                  return (
                    <View key={i} style={styles.itemCard}>
                      <Text
                        style={[
                          styles.itemBadge,
                          loTiene === true && styles.itemTiene,
                          loTiene === false && styles.itemFalta,
                        ]}
                      >
                        {loTiene === true ? "✓" : loTiene === false ? "✗" : "•"}
                      </Text>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemNombre}>{mat.nombre}</Text>
                        {mat.cantidad && (
                          <Text style={styles.itemCantidad}>
                            {mat.cantidad}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {/* ─── Herramientas ─── */}
            {proyecto.herramientas.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Herramientas necesarias</Text>
                {proyecto.herramientas.map((her, i) => {
                  const matchData = recomendacion?.herramientasMatch.find(
                    (h) => h.nombre === her.nombre
                  );
                  const laTiene = matchData?.loTieneElUsuario;
                  return (
                    <View key={i} style={styles.itemCard}>
                      <Text
                        style={[
                          styles.itemBadge,
                          laTiene === true && styles.itemTiene,
                          laTiene === false && styles.itemFalta,
                        ]}
                      >
                        {laTiene === true
                          ? "✓"
                          : laTiene === false
                          ? "✗"
                          : "🔧"}
                      </Text>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemNombre}>{her.nombre}</Text>
                        {her.tipo && (
                          <Text style={styles.itemCantidad}>{her.tipo}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {/* ─── Pasos ─── */}
            {proyecto.pasos.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Paso a paso</Text>
                {proyecto.pasos.map((paso, i) => (
                  <View key={i} style={styles.pasoItem}>
                    <View style={styles.pasoNumero}>
                      <Text style={styles.pasoNumeroText}>
                        {paso.numeroOrden}
                      </Text>
                    </View>
                    <Text style={styles.pasoDescripcion}>
                      {paso.descripcion}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {/* ─── Acciones ─── */}
            <View style={styles.actions}>
              {/* Botón principal: Empezar o Continuar el proyecto */}
              <TouchableOpacity
                style={styles.empezarBtn}
                onPress={handleEmpezarOContinuar}
                activeOpacity={0.85}
                disabled={proyectoEnProgresoVM.isSaving}
              >
                <Text style={styles.empezarIcon}>▶</Text>
                <Text style={styles.empezarText}>
                  {seguimientoActivo
                    ? `Continuar (${seguimientoActivo.porcentajeCompletado}%)`
                    : "Empezar este proyecto"}
                </Text>
              </TouchableOpacity>

              {!esPropio && (
                <Button
                  title={esFav ? "♥ Guardado" : "♡ Guardar"}
                  onPress={() => favoritoVM.toggleFavorito(userId, proyecto.id)}
                  variant={esFav ? "primary" : "outline"}
                />
              )}

              {esPropio && (
                <Button
                  title="Eliminar proyecto"
                  onPress={handleEliminar}
                  variant="danger"
                />
              )}
            </View>
          </View>
        </Animated.ScrollView>

        {/* Botón back fijo encima del hero (no se mueve al scrollear) */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: SPACING.xl },

  // Hero
  heroImage: {
    height: 240,
    backgroundColor: COLORS.bgWarm,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  heroImageReal: {
    width: "100%" as any,
    height: "100%" as any,
    position: "absolute" as const,
  },
  heroEmoji: {
    fontSize: 56,
  },
  backButton: {
    position: "absolute",
    top: SPACING.xl + 8,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 10,
  },
  canMakeBadge: {
    position: "absolute",
    bottom: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.green,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  canMakeText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },

  // Contenido
  content: {
    padding: SPACING.md,
  },
  nombre: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  chipDificultad: {
    backgroundColor: COLORS.bgWarm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  chipDificultadText: {
    fontSize: 12,
    color: COLORS.textMid,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  visibilidad: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  etiquetasRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  etiqueta: {
    backgroundColor: COLORS.bgWarm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  etiquetaText: {
    fontSize: 11,
    color: COLORS.textMid,
    fontWeight: "600",
  },

  // Tarjeta de match
  matchCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  matchTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  matchPercent: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.green,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.bgWarm,
    borderRadius: RADIUS.full,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: "100%" as any,
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.full,
  },
  matchSub: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "500",
  },

  // Section titles
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMid,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  descripcion: {
    fontSize: 15,
    color: COLORS.textMid,
    lineHeight: 22,
  },

  // Items de material/herramienta como mini-cards
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  itemBadge: {
    fontSize: 18,
    width: 28,
    textAlign: "center",
    fontWeight: "700",
  },
  itemTiene: {
    color: COLORS.green,
  },
  itemFalta: {
    color: COLORS.danger,
  },
  itemInfo: {
    flex: 1,
  },
  itemNombre: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
  },
  itemCantidad: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },

  // Pasos
  pasoItem: {
    flexDirection: "row",
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.md,
    alignItems: "flex-start",
  },
  pasoNumero: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  pasoNumeroText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 15,
  },
  pasoDescripcion: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMid,
    lineHeight: 20,
    paddingTop: 6,
  },

  // Acciones
  actions: {
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  // Botón principal "Empezar / Continuar" — verde y destacado
  empezarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  empezarIcon: {
    fontSize: 16,
    color: COLORS.white,
  },
  empezarText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 0.3,
  },
});
