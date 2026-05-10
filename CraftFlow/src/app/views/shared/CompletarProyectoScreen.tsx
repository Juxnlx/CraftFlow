import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
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

type CompletarProyectoScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

/**
 * Convierte segundos a una cadena humana: "2h 15min", "45min", "30s".
 * Se usa para resumir el tiempo invertido en el proyecto al cerrarlo.
 */
const formatearDuracion = (segundos: number): string => {
  if (segundos < 60) return `${segundos}s`;
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  if (horas === 0) return `${minutos}min`;
  if (minutos === 0) return `${horas}h`;
  return `${horas}h ${minutos}min`;
};

/**
 * Pantalla final del modo realización: el usuario marca el proyecto como
 * completado, opcionalmente añade una foto del resultado y una reflexión.
 *
 * Al guardar, se cierra el seguimiento (estado "completado") y la pantalla
 * vuelve al detalle del proyecto.
 */
export const CompletarProyectoScreen = observer(
  ({ navigation }: CompletarProyectoScreenProps) => {
    const proyecto = proyectoVM.proyectoDetalle;
    const seguimiento = proyectoEnProgresoVM.proyectoActivo;

    const [imagenLocal, setImagenLocal] = useState<string | null>(null);
    const [nota, setNota] = useState("");
    const [subiendoFoto, setSubiendoFoto] = useState(false);

    if (!proyecto || !seguimiento) {
      return <LoadingSpinner />;
    }

    const tiempoFormateado = formatearDuracion(
      proyectoEnProgresoVM.tiempoTotalSegundos
    );

    const handlePickImage = async () => {
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
        nota.trim() || null
      );
      if (ok) {
        // Volvemos saltando RealizandoProyecto y CompletarProyecto: el usuario
        // aterriza en el detalle del proyecto que acaba de terminar.
        navigation.pop(2);
      }
    };

    const handleCancelar = () => {
      Alert.alert(
        "¿Cancelar?",
        "Perderás esta foto y la nota, pero el progreso del proyecto seguirá guardado.",
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

          {/* ─── Nota personal ─── */}
          <Text style={styles.sectionTitle}>Tu reflexión</Text>
          <Text style={styles.sectionHint}>
            ¿Qué tal te ha salido? ¿Lo recomendarías? (opcional)
          </Text>
          <TextInput
            style={styles.notaInput}
            placeholder="Me ha gustado mucho hacerlo, lo siguiente que probaré es..."
            placeholderTextColor={COLORS.textLight}
            value={nota}
            onChangeText={setNota}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.notaCounter}>{nota.length} / 500</Text>

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
    paddingTop: SPACING.xl + 16,
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
  notaInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 100,
  },
  notaCounter: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: "right",
    marginTop: SPACING.xs,
  },

  // Acciones
  actions: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
});
