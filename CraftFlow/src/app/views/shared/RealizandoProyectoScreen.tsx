import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { observer } from "mobx-react-lite";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  proyectoVM,
  proyectoEnProgresoVM,
} from "../../../presentation/viewmodels";
import { container } from "../../../core/container";
import { TYPES } from "../../../core/types";
import { IUploadImageUseCase } from "../../../domain/interfaces/usecases/IStorageUseCases";
import { LoadingSpinner } from "../../../presentation/components/common/LoadingSpinner";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";

/** Props inyectadas por React Navigation a la pantalla de realización */
type RealizandoProyectoScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

/** Unidades de tiempo soportadas en el selector por paso */
type UnidadTiempo = "min" | "h" | "d";

/** Factor para pasar de cada unidad a segundos */
const FACTOR_SEGUNDOS: Record<UnidadTiempo, number> = {
  min: 60,
  h: 3600,
  d: 86400,
};

/**
 * Descompone los segundos guardados en {valor, unidad}, eligiendo la
 * unidad más natural: días si encaja exacto, luego horas, si no minutos.
 */
const descomponerTiempo = (
  segundos: number
): { valor: string; unidad: UnidadTiempo } => {
  if (segundos <= 0) return { valor: "", unidad: "min" };
  if (segundos % FACTOR_SEGUNDOS.d === 0) {
    return { valor: String(segundos / FACTOR_SEGUNDOS.d), unidad: "d" };
  }
  if (segundos % FACTOR_SEGUNDOS.h === 0) {
    return { valor: String(segundos / FACTOR_SEGUNDOS.h), unidad: "h" };
  }
  return { valor: String(Math.round(segundos / FACTOR_SEGUNDOS.min)), unidad: "min" };
};

/**
 * Pantalla "Realizando proyecto": acompaña al usuario mientras hace
 * un proyecto. Marca pasos completados, mide el tiempo invertido y permite
 * subir fotos por paso. Cuando todos los pasos están completos, ofrece
 * cerrar el proyecto como completado.
 */
export const RealizandoProyectoScreen = observer(
  ({ navigation }: RealizandoProyectoScreenProps) => {
    const proyecto = proyectoVM.proyectoDetalle;
    const seguimiento = proyectoEnProgresoVM.proyectoActivo;

    // Para mostrar feedback de subida de foto por paso
    const [pasoSubiendoFoto, setPasoSubiendoFoto] = useState<number | null>(null);

    // Edición local del tiempo por paso. Por cada paso guardamos {valor, unidad}.
    // Persistimos en Firestore al perder el foco (onBlur) o al cambiar la unidad.
    const [tiempoEditando, setTiempoEditando] = useState<
      Record<number, { valor: string; unidad: UnidadTiempo }>
    >({});

    if (!proyecto || !seguimiento) {
      return <LoadingSpinner />;
    }

    const pasosCompletados = seguimiento.pasosCompletados;
    const totalPasos = pasosCompletados.length;
    const completados = pasosCompletados.filter((p) => p.completado).length;
    const porcentaje =
      totalPasos === 0 ? 0 : Math.round((completados / totalPasos) * 100);
    const todoHecho = totalPasos > 0 && completados === totalPasos;

    /** Vuelve a la pantalla anterior sin cerrar el seguimiento. */
    const handleSalir = () => {
      navigation.goBack();
    };

    /** Marca o desmarca un paso como completado. */
    const handleTogglePaso = (numeroOrden: number, completado: boolean) => {
      proyectoEnProgresoVM.marcarPaso(numeroOrden, !completado);
    };

    /** Abre la galería, sube la imagen a Cloudinary y la asocia al paso. */
    const handleSubirFoto = async (numeroOrden: number) => {
      // En Android 13+ los permisos de galería son granulares y hay que
      // pedirlos explícitamente, si no el picker falla en silencio.
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permiso.status !== "granted") {
        Alert.alert(
          "Permiso necesario",
          "Para añadir una foto del paso necesitamos acceso a la galería. Actívalo desde los ajustes del móvil."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });
      if (result.canceled || !result.assets[0]) return;

      try {
        setPasoSubiendoFoto(numeroOrden);
        const uploadUseCase = container.get<IUploadImageUseCase>(
          TYPES.IUploadImageUseCase
        );
        const { url } = await uploadUseCase.execute(
          result.assets[0].uri,
          "proyectos"
        );
        // Mantener el estado actual del checkbox y solo añadir la foto
        const pasoActual = pasosCompletados.find(
          (p) => p.numeroOrden === numeroOrden
        );
        await proyectoEnProgresoVM.marcarPaso(
          numeroOrden,
          pasoActual?.completado ?? false,
          url
        );
      } catch {
        Alert.alert("Error", "No se pudo subir la foto. Inténtalo de nuevo.");
      } finally {
        setPasoSubiendoFoto(null);
      }
    };

    /** Salta a la pantalla de completar (foto de resultado, nota final, etc.). */
    const handleTerminar = () => {
      navigation.navigate("CompletarProyecto");
    };

    /**
     * Persiste el tiempo del paso al perder el foco o al cambiar la unidad.
     * Convierte el valor introducido a segundos según la unidad elegida.
     * Texto vacío equivale a 0 (no contabilizado).
     */
    const handleGuardarTiempo = (numeroOrden: number) => {
      const editado = tiempoEditando[numeroOrden];
      if (editado === undefined) return;
      const num = parseInt(editado.valor, 10);
      const segundos = isNaN(num)
        ? 0
        : Math.max(0, num) * FACTOR_SEGUNDOS[editado.unidad];
      proyectoEnProgresoVM.actualizarTiempoPaso(numeroOrden, segundos);
    };

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* ─── Cabecera con back ─── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleSalir}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <View style={{ width: 40 }} />
          </View>

          {/* ─── Hero con info del proyecto ─── */}
          <View style={styles.proyectoCard}>
            {proyecto.imagen ? (
              <Image
                source={{ uri: proyecto.imagen }}
                style={styles.proyectoImagen}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.proyectoEmojiBox}>
                <Text style={styles.proyectoEmoji}>🎨</Text>
              </View>
            )}
            <View style={styles.proyectoInfo}>
              <Text style={styles.proyectoLabel}>Realizando</Text>
              <Text style={styles.proyectoNombre} numberOfLines={2}>
                {proyecto.nombre}
              </Text>
            </View>
          </View>

          {/* ─── Barra de progreso ─── */}
          <View style={styles.progresoBox}>
            <View style={styles.progresoHeader}>
              <Text style={styles.progresoTexto}>
                {completados} de {totalPasos} pasos
              </Text>
              <Text style={styles.progresoPercent}>{porcentaje}%</Text>
            </View>
            <View style={styles.progresoTrack}>
              <View style={[styles.progresoFill, { width: `${porcentaje}%` }]} />
            </View>
          </View>

          {/* ─── Lista de pasos ─── */}
          <Text style={styles.sectionTitle}>Pasos del proyecto</Text>
          {proyecto.pasos.map((paso) => {
            const estado = pasosCompletados.find(
              (p) => p.numeroOrden === paso.numeroOrden
            );
            const completado = estado?.completado ?? false;
            const fotoUrl = estado?.fotoProgreso ?? null;
            const subiendo = pasoSubiendoFoto === paso.numeroOrden;

            // Si el usuario está editando este paso, usamos su valor/unidad;
            // si no, derivamos {valor, unidad} desde lo guardado en BD.
            const editado = tiempoEditando[paso.numeroOrden];
            const guardado = descomponerTiempo(estado?.tiempoSegundos ?? 0);
            const valorInput = editado?.valor ?? guardado.valor;
            const unidadActual = editado?.unidad ?? guardado.unidad;

            return (
              <View
                key={paso.numeroOrden}
                style={[styles.pasoCard, completado && styles.pasoCardDone]}
              >
                <TouchableOpacity
                  style={styles.pasoFila}
                  onPress={() =>
                    handleTogglePaso(paso.numeroOrden, completado)
                  }
                  activeOpacity={0.7}
                >
                  {/* Checkbox circular */}
                  <View
                    style={[
                      styles.checkbox,
                      completado && styles.checkboxDone,
                    ]}
                  >
                    {completado && (
                      <Ionicons name="checkmark" size={18} color={COLORS.white} />
                    )}
                  </View>
                  <View style={styles.pasoTexto}>
                    <Text style={styles.pasoNumero}>
                      Paso {paso.numeroOrden}
                    </Text>
                    <Text
                      style={[
                        styles.pasoDescripcion,
                        completado && styles.pasoDescripcionDone,
                      ]}
                    >
                      {paso.descripcion}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Tiempo invertido en este paso (opcional) */}
                <View style={styles.tiempoFila}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={COLORS.textMid}
                  />
                  <Text style={styles.tiempoLabel}>Tiempo:</Text>
                  <TextInput
                    style={styles.tiempoInput}
                    value={valorInput}
                    onChangeText={(t) =>
                      setTiempoEditando((prev) => ({
                        ...prev,
                        [paso.numeroOrden]: {
                          valor: t.replace(/[^0-9]/g, ""),
                          unidad: prev[paso.numeroOrden]?.unidad ?? unidadActual,
                        },
                      }))
                    }
                    onBlur={() => handleGuardarTiempo(paso.numeroOrden)}
                    placeholder="0"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  {(["min", "h", "d"] as UnidadTiempo[]).map((u) => {
                    const activa = unidadActual === u;
                    return (
                      <TouchableOpacity
                        key={u}
                        onPress={() => {
                          setTiempoEditando((prev) => ({
                            ...prev,
                            [paso.numeroOrden]: {
                              valor:
                                prev[paso.numeroOrden]?.valor ?? valorInput,
                              unidad: u,
                            },
                          }));
                          // Persistir inmediatamente al cambiar unidad
                          setTimeout(
                            () => handleGuardarTiempo(paso.numeroOrden),
                            0
                          );
                        }}
                        style={[
                          styles.unidadChip,
                          activa && styles.unidadChipActiva,
                        ]}
                      >
                        <Text
                          style={[
                            styles.unidadChipText,
                            activa && styles.unidadChipTextActiva,
                          ]}
                        >
                          {u}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Foto del paso (si existe o botón para añadirla) */}
                {fotoUrl ? (
                  <View style={styles.fotoBox}>
                    <Image
                      source={{ uri: fotoUrl }}
                      style={styles.fotoPreview}
                      resizeMode="cover"
                    />
                    <View style={styles.fotoAccionesRow}>
                      <TouchableOpacity
                        style={styles.cambiarFotoBtn}
                        onPress={() => handleSubirFoto(paso.numeroOrden)}
                        disabled={subiendo}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.cambiarFotoText}>
                          {subiendo ? "Subiendo..." : "Cambiar"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.quitarFotoBtn}
                        onPress={() =>
                          proyectoEnProgresoVM.marcarPaso(
                            paso.numeroOrden,
                            completado,
                            null
                          )
                        }
                        disabled={subiendo}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.quitarFotoText}>Quitar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.subirFotoBtn}
                    onPress={() => handleSubirFoto(paso.numeroOrden)}
                    disabled={subiendo}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.subirFotoText}>
                      {subiendo ? "Subiendo foto..." : "Añadir foto del paso"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {/* ─── Botón terminar (solo si todo está hecho) ─── */}
          {todoHecho && (
            <TouchableOpacity
              style={styles.terminarBtn}
              onPress={handleTerminar}
              activeOpacity={0.9}
              disabled={proyectoEnProgresoVM.isSaving}
            >
              <Text style={styles.terminarEmoji}>🎉</Text>
              <Text style={styles.terminarText}>¡Lo he terminado!</Text>
            </TouchableOpacity>
          )}

          {/* Hint si no está todo terminado */}
          {!todoHecho && totalPasos > 0 && (
            <Text style={styles.hint}>
              Marca todos los pasos para poder cerrar el proyecto
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  // Cabecera
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
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
  cronoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cronoText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
    fontVariant: ["tabular-nums"],
  },

  // Card del proyecto
  proyectoCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm + 4,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.md,
    alignItems: "center",
  },
  proyectoImagen: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
  },
  proyectoEmojiBox: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgWarm,
    justifyContent: "center",
    alignItems: "center",
  },
  proyectoEmoji: {
    fontSize: 28,
  },
  proyectoInfo: {
    flex: 1,
  },
  proyectoLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  proyectoNombre: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 2,
  },

  // Barra de progreso
  progresoBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  progresoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  progresoTexto: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  progresoPercent: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.green,
  },
  progresoTrack: {
    height: 8,
    backgroundColor: COLORS.bgWarm,
    borderRadius: RADIUS.full,
    overflow: "hidden",
  },
  progresoFill: {
    height: "100%" as any,
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.full,
  },

  // Sección
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMid,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },

  // Pasos
  pasoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  pasoCardDone: {
    backgroundColor: COLORS.greenLight,
    borderColor: COLORS.green,
  },
  pasoFila: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  checkboxDone: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  pasoTexto: {
    flex: 1,
  },
  pasoNumero: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pasoDescripcion: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginTop: 2,
  },
  pasoDescripcionDone: {
    textDecorationLine: "line-through" as const,
    color: COLORS.textMid,
  },

  // Tiempo opcional por paso
  tiempoFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignSelf: "flex-start",
  },
  tiempoLabel: {
    fontSize: 12,
    color: COLORS.textMid,
    fontWeight: "600",
  },
  tiempoInput: {
    minWidth: 40,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "700",
    paddingVertical: 0,
    textAlign: "center",
  },
  unidadChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  unidadChipActiva: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  unidadChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMid,
  },
  unidadChipTextActiva: {
    color: COLORS.white,
  },
  // Foto del paso
  subirFotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderStyle: "dashed" as any,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.bg,
  },
  subirFotoText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  fotoBox: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: "hidden",
  },
  fotoPreview: {
    width: "100%" as any,
    height: 160,
    backgroundColor: COLORS.bgWarm,
  },
  fotoAccionesRow: {
    flexDirection: "row",
  },
  cambiarFotoBtn: {
    flex: 1,
    paddingVertical: SPACING.xs + 2,
    alignItems: "center",
    backgroundColor: COLORS.bgWarm,
  },
  cambiarFotoText: {
    fontSize: 12,
    color: COLORS.textMid,
    fontWeight: "700",
  },
  quitarFotoBtn: {
    flex: 1,
    paddingVertical: SPACING.xs + 2,
    alignItems: "center",
    backgroundColor: COLORS.bgWarm,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.borderLight,
  },
  quitarFotoText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: "700",
  },

  // Botón terminar
  terminarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  terminarEmoji: {
    fontSize: 20,
  },
  terminarText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // Hint
  hint: {
    marginTop: SPACING.md,
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
    fontStyle: "italic",
  },
});
