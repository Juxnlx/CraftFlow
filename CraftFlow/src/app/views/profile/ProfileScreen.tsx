import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { observer } from "mobx-react-lite";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { ProfileStackParamList } from "../../../presentation/navigation/MainNavigator";
import { auth } from "../../../config/firebaseConfig";
import {
  authVM,
  proyectoVM,
  materialVM,
  favoritoVM,
  usuarioVM,
  proyectoEnProgresoVM,
} from "../../../presentation/viewmodels";
import { Button } from "../../../presentation/components/common/Button";
import { FadeInItem } from "../../../presentation/components/common/FadeInItem";
import { Proyecto } from "../../../domain/entities/Proyecto";
import { ProyectoEnProgreso } from "../../../domain/entities/ProyectoEnProgreso";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";

/** Props inyectadas por React Navigation a la pantalla de perfil */
type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "ProfileMain">;
};

/** Identificador de la pestaña activa dentro del perfil */
type TabKey = "mios" | "enProceso" | "terminados";

/**
 * Pantalla de perfil del usuario con tres pestañas: proyectos creados,
 * proyectos en proceso y proyectos terminados. Incluye también stats
 * básicas y el botón de cerrar sesión.
 */
export const ProfileScreen = observer(({ navigation }: ProfileScreenProps) => {
  const userId = auth.currentUser?.uid || "";
  const userEmail = auth.currentUser?.email || "";
  const usuario = usuarioVM.usuarioActual;
  const userName = usuario?.nombre || auth.currentUser?.displayName || "Usuario";
  const avatarUrl = usuario?.fotoPerfil || null;

  const [tab, setTab] = useState<TabKey>("mios");

  // Cache local idProyecto → Proyecto para enProceso y terminados.
  const [proyectosCache, setProyectosCache] = useState<Record<string, Proyecto>>(
    {}
  );

  useEffect(() => {
    if (userId) {
      usuarioVM.cargarUsuario(userId);
      proyectoVM.cargarMisProyectos(userId);
      proyectoEnProgresoVM.cargarMisProyectosEnProgreso(userId);
      proyectoEnProgresoVM.cargarCompletados(userId);
    }
  }, [userId]);

  // Refresco al recibir foco para reflejar cambios al volver.
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        proyectoEnProgresoVM.cargarMisProyectosEnProgreso(userId);
        proyectoEnProgresoVM.cargarCompletados(userId);
      }
    }, [userId])
  );

  // Cargar Proyectos asociados a seguimientos (enProceso + completados).
  useEffect(() => {
    const ids = [
      ...proyectoEnProgresoVM.proyectosEnProgreso.map((s) => s.idProyecto),
      ...proyectoEnProgresoVM.proyectosCompletados.map((s) => s.idProyecto),
    ];
    const idsUnicos = [...new Set(ids)].filter((id) => !proyectosCache[id]);
    if (idsUnicos.length === 0) return;
    proyectoVM.cargarProyectosPorIds(idsUnicos).then((proys) => {
      setProyectosCache((prev) => {
        const next = { ...prev };
        proys.forEach((p) => (next[p.id] = p));
        return next;
      });
    });
  }, [
    proyectoEnProgresoVM.proyectosEnProgreso,
    proyectoEnProgresoVM.proyectosCompletados,
  ]);

  // Listas resueltas para cada tab. En proceso ordenado por % desc.
  const enProceso = useMemo(
    () =>
      proyectoEnProgresoVM.proyectosEnProgreso
        .map((s) => ({ seguimiento: s, proyecto: proyectosCache[s.idProyecto] }))
        .filter((x) => x.proyecto)
        .sort(
          (a, b) =>
            b.seguimiento.porcentajeCompletado -
            a.seguimiento.porcentajeCompletado
        ),
    [proyectoEnProgresoVM.proyectosEnProgreso, proyectosCache]
  );

  const terminados = useMemo(
    () =>
      proyectoEnProgresoVM.proyectosCompletados
        .map((s) => ({ seguimiento: s, proyecto: proyectosCache[s.idProyecto] }))
        .filter((x) => x.proyecto),
    [proyectoEnProgresoVM.proyectosCompletados, proyectosCache]
  );

  /** Pide confirmación y abandona un seguimiento en curso. */
  const handleAbandonarSeguimiento = (idSeguimiento: string, nombre: string) => {
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

  /** Pide confirmación y elimina un proyecto del usuario (borrado lógico). */
  const handleEliminarProyecto = (id: string, nombre: string) => {
    Alert.alert(
      "Eliminar proyecto",
      `¿Seguro que quieres eliminar "${nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => proyectoVM.eliminarProyecto(id),
        },
      ]
    );
  };

  /** Pide confirmación y cierra la sesión del usuario. */
  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: () => authVM.logout(),
      },
    ]);
  };

  // Datos de la lista según tab activa. Tipos abiertos para que FlatList
  // acepte cualquiera de los tres formatos.
  const data: any[] =
    tab === "mios"
      ? proyectoVM.misProyectos
      : tab === "enProceso"
      ? enProceso
      : terminados;

  const keyExtractor = (item: any) =>
    tab === "mios" ? item.id : item.seguimiento.id;

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (tab === "mios") {
      return renderMioItem(item as Proyecto, index);
    }
    if (tab === "enProceso") {
      return renderEnProcesoItem(
        item.seguimiento as ProyectoEnProgreso,
        item.proyecto as Proyecto,
        index
      );
    }
    return renderTerminadoItem(
      item.seguimiento as ProyectoEnProgreso,
      item.proyecto as Proyecto,
      index
    );
  };

  /** Renderiza un proyecto creado por el usuario (tab "Mis proyectos"). */
  const renderMioItem = (item: Proyecto, index: number) => (
    <FadeInItem index={index}>
      <TouchableOpacity
        style={styles.projectItem}
        onPress={() =>
          navigation.navigate("ProjectDetail", { idProyecto: item.id })
        }
        activeOpacity={0.85}
      >
        {item.imagen ? (
          <Image
            source={{ uri: item.imagen }}
            style={styles.projectImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.projectEmojiBox}>
            <Text style={styles.projectEmoji}>🎨</Text>
          </View>
        )}
        <View style={styles.projectInfo}>
          <Text style={styles.projectName} numberOfLines={1}>
            {item.nombre}
          </Text>
          <View style={styles.projectMeta}>
            <Text style={styles.projectVisibility}>
              {item.visibilidad === "publico" ? "🌍 Público" : "🔒 Privado"}
            </Text>
            {item.etiquetas.slice(0, 2).map((et, i) => (
              <Text key={i} style={styles.projectTag}>
                {et}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.projectActions}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CreateProject", { idEditar: item.id })
            }
            style={styles.actionBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.editBtnText}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleEliminarProyecto(item.id, item.nombre)}
            style={styles.actionBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </FadeInItem>
  );

  /** Renderiza un proyecto en curso con su barra de progreso. */
  const renderEnProcesoItem = (
    seguimiento: ProyectoEnProgreso,
    proyecto: Proyecto,
    index: number
  ) => {
    const pct = seguimiento.porcentajeCompletado;
    return (
      <FadeInItem index={index}>
        <TouchableOpacity
          style={styles.projectItem}
          onPress={() =>
            navigation.navigate("ProjectDetail", { idProyecto: proyecto.id })
          }
          activeOpacity={0.85}
        >
          {proyecto.imagen ? (
            <Image
              source={{ uri: proyecto.imagen }}
              style={styles.projectImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.projectEmojiBox}>
              <Text style={styles.projectEmoji}>🎨</Text>
            </View>
          )}
          <View style={styles.projectInfo}>
            <Text style={styles.projectName} numberOfLines={1}>
              {proyecto.nombre}
            </Text>
            <Text style={styles.projectVisibility}>{pct}% completado</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              handleAbandonarSeguimiento(seguimiento.id, proyecto.nombre)
            }
            style={styles.actionBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </FadeInItem>
    );
  };

  /** Renderiza un proyecto terminado con la foto del resultado y la fecha. */
  const renderTerminadoItem = (
    seguimiento: ProyectoEnProgreso,
    proyecto: Proyecto,
    index: number
  ) => {
    const fecha = seguimiento.fechaCompletado
      ? seguimiento.fechaCompletado.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";
    return (
      <FadeInItem index={index}>
        <TouchableOpacity
          style={styles.projectItem}
          onPress={() =>
            navigation.navigate("ProjectDetail", { idProyecto: proyecto.id })
          }
          activeOpacity={0.85}
        >
          {seguimiento.imagenResultado || proyecto.imagen ? (
            <Image
              source={{ uri: seguimiento.imagenResultado || proyecto.imagen! }}
              style={styles.projectImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.projectEmojiBox}>
              <Text style={styles.projectEmoji}>🏆</Text>
            </View>
          )}
          <View style={styles.projectInfo}>
            <Text style={styles.projectName} numberOfLines={1}>
              {proyecto.nombre}
            </Text>
            <Text style={styles.projectVisibility}>✓ Terminado · {fecha}</Text>
          </View>
        </TouchableOpacity>
      </FadeInItem>
    );
  };

  // Configuración del estado vacío según la tab.
  const empty = {
    mios: {
      icon: "✂️",
      title: "Aún no has creado proyectos",
      subtitle:
        "Comparte tus creaciones con la comunidad y ayuda a otros a inspirarse",
      cta: "Crear mi primer proyecto",
      onPress: () => navigation.navigate("CreateProject"),
    },
    enProceso: {
      icon: "🧶",
      title: "No tienes proyectos en proceso",
      subtitle:
        "Empieza un proyecto desde Explorar o Guardados para verlo aquí",
      cta: null,
      onPress: () => {},
    },
    terminados: {
      icon: "🏆",
      title: "Aún no has terminado ningún proyecto",
      subtitle:
        "Cuando completes un proyecto en proceso, aparecerá aquí en tu historial",
      cta: null,
      onPress: () => {},
    },
  }[tab];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ─── Hero de perfil ─── */}
            <View style={styles.profileHeader}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>

              {usuario?.intereses && usuario.intereses.length > 0 && (
                <View style={styles.interesesRow}>
                  {usuario.intereses.map((interes, i) => (
                    <View key={i} style={styles.interesChip}>
                      <Text style={styles.interesText}>
                        {interes.charAt(0).toUpperCase() + interes.slice(1)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate("EditProfile")}
                activeOpacity={0.85}
              >
                <Text style={styles.editButtonText}>Editar perfil</Text>
              </TouchableOpacity>
            </View>

            {/* ─── Stats ─── */}
            <View style={styles.statsCard}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {materialVM.materiales.length}
                </Text>
                <Text style={styles.statLabel}>
                  material{materialVM.materiales.length !== 1 ? "es" : ""}
                </Text>
              </View>
              <View style={styles.statDivisor} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {proyectoVM.misProyectos.length}
                </Text>
                <Text style={styles.statLabel}>
                  proyecto{proyectoVM.misProyectos.length !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.statDivisor} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {favoritoVM.favoritos.length}
                </Text>
                <Text style={styles.statLabel}>
                  guardado{favoritoVM.favoritos.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>

            {/* ─── Tabs segmentadas ─── */}
            <View style={styles.tabsRow}>
              {(
                [
                  { key: "mios", label: "Mis proyectos" },
                  { key: "enProceso", label: "En proceso" },
                  { key: "terminados", label: "Terminados" },
                ] as { key: TabKey; label: string }[]
              ).map((t) => {
                const activo = tab === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => setTab(t.key)}
                    style={[styles.tabButton, activo && styles.tabButtonActive]}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[styles.tabText, activo && styles.tabTextActive]}
                      numberOfLines={1}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Botón + Crear: solo en Mis proyectos */}
            {tab === "mios" && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {proyectoVM.misProyectos.length} proyecto
                  {proyectoVM.misProyectos.length !== 1 ? "s" : ""} creado
                  {proyectoVM.misProyectos.length !== 1 ? "s" : ""}
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => navigation.navigate("CreateProject")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.createButtonText}>+ Crear</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{empty.icon}</Text>
            <Text style={styles.emptyTitle}>{empty.title}</Text>
            <Text style={styles.emptySubtitle}>{empty.subtitle}</Text>
            {empty.cta && (
              <Button
                title={empty.cta}
                onPress={empty.onPress}
                style={styles.emptyButton}
              />
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Button
              title="Cerrar sesión"
              onPress={handleLogout}
              variant="danger"
            />
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
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 38,
    fontWeight: "700",
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  interesesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  interesChip: {
    backgroundColor: COLORS.bgWarm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  interesText: {
    fontSize: 12,
    color: COLORS.textMid,
    fontWeight: "600",
  },
  editButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
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
  statDivisor: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.borderLight,
  },
  // Tabs
  tabsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMid,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  // Cabecera con botón crear (solo Mis proyectos)
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },
  // Cards
  projectItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.md,
  },
  projectImage: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
  },
  projectEmojiBox: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgWarm,
    justifyContent: "center",
    alignItems: "center",
  },
  projectEmoji: {
    fontSize: 26,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  projectMeta: {
    flexDirection: "row",
    gap: SPACING.sm,
    alignItems: "center",
    flexWrap: "wrap",
  },
  projectVisibility: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  projectTag: {
    fontSize: 11,
    color: COLORS.textMid,
    backgroundColor: COLORS.bgWarm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  projectActions: {
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
  editBtnText: {
    fontSize: 16,
    color: COLORS.textMid,
  },
  deleteBtnText: {
    fontSize: 16,
    color: COLORS.danger,
  },
  // Barra de progreso (en proceso)
  progressBar: {
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgWarm,
    marginTop: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  // Estado vacío
  emptyContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  emptyIcon: {
    fontSize: 56,
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
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    width: "85%" as any,
  },
  footer: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});
