import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
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
import { Button } from "../../../presentation/components/common/Button";
import { LoadingSpinner } from "../../../presentation/components/common/LoadingSpinner";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";

/** Props inyectadas por React Navigation a la pantalla de completar */
type CompletarProyectoScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

/** Convierte segundos a una cadena humana del estilo "2h 15min", "45min" o "30s". */
const formatearDuracion = (segundos: number): string => {
  if (segundos < 60) {
    return `${segundos}s`;
  }
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  if (horas === 0) {
    return `${minutos}min`;
  }
  if (minutos === 0) {
    return `${horas}h`;
  }
  return `${horas}h ${minutos}min`;
};

/**
 * Pantalla final del modo realización: el usuario añade opcionalmente una
 * foto del resultado y cierra el seguimiento como completado. Al guardar
 * volvemos al detalle del proyecto saltando las dos pantallas intermedias.
 */
export const CompletarProyectoScreen = observer(
  ({ navigation }: CompletarProyectoScreenProps) => {
    const proyecto = proyectoVM.proyectoDetalle;
    const seguimiento = proyectoEnProgresoVM.proyectoActivo;

    const [imagenLocal, setImagenLocal] = useState<string | null>(null);
    const [subiendoFoto, setSubiendoFoto] = useState(false);

    if (!proyecto || !seguimiento) {
      return <LoadingSpinner />;
    }

    const tiempoFormateado = formatearDuracion(
      proyectoEnProgresoVM.tiempoTotalSegundos
    );

    /** Abre la galería del dispositivo para escoger una foto del resultado. */
    const handlePickImage = async () => {
      // En Android 13+ los permisos de galería son granulares y hay que
      // pedirlos explícitamente, si no el picker falla en silencio.
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso necesario",
          "Para añadir la foto del resultado necesitamos acceso a la galería. Actívalo desde los ajustes del móvil."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setImagenLocal(result.assets[0].uri);
      }
    };

    /**
     * Sube la foto si la hay, marca el seguimiento como completado y
     * vuelve directamente al detalle del proyecto.
     */
    const handleGuardar = async () => {
      let imagenUrl: string | null = null;

      // Si el usuario eligió foto, subimos primero a Cloudinary
      if (imagenLocal) {
        try {
          setSubiendoFoto(true);
          const uploadUseCase = container.get<IUploadImageUseCase>(
            TYPES.IUploadImageUseCase
          );
          const { url } = await uploadUseCase.execute(imagenLocal, "proyectos");
          imagenUrl = url;
        } catch {
          Alert.alert(
            "Error",
            "No se pudo subir la foto. Inténtalo de nuevo o guarda sin foto."
          );
          setSubiendoFoto(false);
          return;
        } finally {
          setSubiendoFoto(false);
        }
      }

      const ok = await proyectoEnProgresoVM.completarProyecto(
        imagenUrl,
        null
      );
      if (ok) {
        // Volvemos saltando RealizandoProyecto y CompletarProyecto: el usuario
        // aterriza en el detalle del proyecto que acaba de terminar.
        navigation.pop(2);
      }
    };

    /** Pide confirmación antes de descartar la foto seleccionada. */
    const handleCancelar = () => {
      Alert.alert(
        "¿Cancelar?",
        "Perderás esta foto, pero el progreso del proyecto seguirá guardado.",
        [
          { text: "Seguir aquí", style: "cancel" },
          {
            text: "Salir sin guardar",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    };

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── Cabecera ─── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleCancelar}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.title}>¡Lo conseguiste!</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* ─── Card celebratoria ─── */}
          <View style={styles.celebraCard}>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.proyectoNombre} numberOfLines={2}>
              {proyecto.nombre}
            </Text>
            <Text style={styles.proyectoCompleted}>Proyecto completado</Text>

            {/* Stats del esfuerzo */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{tiempoFormateado}</Text>
                <Text style={styles.statLabel}>tiempo invertido</Text>
              </View>
              <View style={styles.statDivisor} />
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {seguimiento.pasosCompletados.length}
                </Text>
                <Text style={styles.statLabel}>
                  paso{seguimiento.pasosCompletados.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>

          {/* ─── Foto del resultado ─── */}
          <Text style={styles.sectionTitle}>Foto del resultado</Text>
          <Text style={styles.sectionHint}>
            Comparte cómo te ha quedado (opcional)
          </Text>
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={handlePickImage}
            activeOpacity={0.85}
          >
            {imagenLocal ? (
              <Image source={{ uri: imagenLocal }} style={styles.imagePreview} />
            ) : (
              <>
                <Text style={styles.imageIcon}>📷</Text>
                <Text style={styles.imageText}>Toca para subir foto</Text>
                <Text style={styles.imageHint}>JPG, PNG · máx 10MB</Text>
              </>
            )}
          </TouchableOpacity>
          {imagenLocal && (
            <TouchableOpacity
              style={styles.quitarFotoLink}
              onPress={() => setImagenLocal(null)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
              <Text style={styles.quitarFotoLinkText}>Quitar foto</Text>
            </TouchableOpacity>
          )}

          {/* ─── Acciones ─── */}
          <View style={styles.actions}>
            <Button
              title={subiendoFoto ? "Subiendo foto..." : "Guardar y completar"}
              onPress={handleGuardar}
              loading={subiendoFoto || proyectoEnProgresoVM.isSaving}
            />
            <Button
              title="Cancelar"
              onPress={handleCancelar}
              variant="outline"
            />
          </View>
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
  closeBtn: {
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
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },

  // Card celebratoria (verde)
  celebraCard: {
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  emoji: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },
  proyectoNombre: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.white,
    textAlign: "center",
  },
  proyectoCompleted: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.85,
    fontWeight: "600",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    marginTop: SPACING.md,
    width: "100%" as any,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
  },
  statDivisor: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: SPACING.xs,
  },

  // Section titles
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMid,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },

  // Image picker
  imagePicker: {
    width: "100%" as any,
    height: 180,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderStyle: "dashed" as any,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgWarm,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "hidden" as const,
    marginBottom: SPACING.sm,
  },
  imagePreview: {
    width: "100%" as any,
    height: "100%" as any,
    borderRadius: RADIUS.lg,
  },
  quitarFotoLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  quitarFotoLinkText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: "700",
  },
  imageIcon: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  imageText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMid,
  },
  imageHint: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },

  // Nota
  // Acciones
  actions: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
});
