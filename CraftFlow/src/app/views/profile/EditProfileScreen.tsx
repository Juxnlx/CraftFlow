import React, { useState, useEffect, useRef } from "react";
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
import { ProfileStackParamList } from "../../../presentation/navigation/MainNavigator";
import { auth } from "../../../config/firebaseConfig";
import { usuarioVM } from "../../../presentation/viewmodels";
import { Button } from "../../../presentation/components/common/Button";
import { Input } from "../../../presentation/components/common/Input";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";
import * as ImagePicker from "expo-image-picker";

/** Props inyectadas por React Navigation a la pantalla de editar perfil */
type EditProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "EditProfile">;
};

// Intereses con emoji para el selector. Coinciden con las categorías
// de materiales de la app.
const INTERESES_DISPONIBLES: { key: string; label: string; emoji: string }[] = [
  { key: "crochet", label: "Crochet", emoji: "🧶" },
  { key: "pintura", label: "Pintura", emoji: "🎨" },
  { key: "cerámica", label: "Cerámica", emoji: "🏺" },
  { key: "costura", label: "Costura", emoji: "🧵" },
  { key: "papel", label: "Papel", emoji: "📄" },
  { key: "otras", label: "Otras", emoji: "✨" },
];

/**
 * Pantalla para editar el perfil del usuario.
 * Permite cambiar avatar, nombre e intereses.
 */
export const EditProfileScreen = observer(
  ({ navigation }: EditProfileScreenProps) => {
    const userId = auth.currentUser?.uid || "";
    const userEmail = auth.currentUser?.email || "";
    const usuario = usuarioVM.usuarioActual;

    // Estado local del formulario (se inicializa con los datos actuales)
    const [nombre, setNombre] = useState("");
    const [intereses, setIntereses] = useState<string[]>([]);
    const [avatarLocal, setAvatarLocal] = useState<string | null>(null);
    // True si el usuario ha pulsado "Quitar foto"; el borrado se aplica al guardar
    const [fotoEliminada, setFotoEliminada] = useState(false);

    // Snapshot del formulario al cargar para detectar cambios sin guardar
    // y avisar al usuario antes de perderlos.
    const originalSnapshot = useRef<string>("");
    const guardandoOk = useRef(false);

    /** Serializa el estado actual del formulario para comparar. */
    const getCurrentSnapshot = () =>
      JSON.stringify({ nombre, intereses, avatarLocal, fotoEliminada });

    /** Indica si el usuario ha modificado algo desde la última carga. */
    const hasUnsavedChanges = (): boolean => {
      if (!originalSnapshot.current) {
        return false;
      }
      return getCurrentSnapshot() !== originalSnapshot.current;
    };

    useEffect(() => {
      if (userId) {
        usuarioVM.cargarUsuario(userId);
      }
    }, [userId]);

    // Cuando llegan los datos del usuario, rellenar campos y fijar snapshot.
    useEffect(() => {
      if (usuario) {
        setNombre(usuario.nombre);
        setIntereses([...usuario.intereses]);
        // El timeout asegura que los setState anteriores se han aplicado.
        setTimeout(() => {
          originalSnapshot.current = JSON.stringify({
            nombre: usuario.nombre,
            intereses: [...usuario.intereses],
            avatarLocal: null,
            fotoEliminada: false,
          });
        }, 100);
      }
    }, [usuario]);

    // Aviso de cambios sin guardar al salir (header back, swipe iOS, back físico)
    useEffect(() => {
      const unsubscribe = navigation.addListener("beforeRemove", (e) => {
        if (guardandoOk.current) {
          return;
        }
        if (!hasUnsavedChanges()) {
          return;
        }
        e.preventDefault();
        Alert.alert(
          "¿Salir sin guardar?",
          "Vas a perder los cambios del perfil.",
          [
            {
              text: "Salir",
              style: "destructive",
              onPress: () => navigation.dispatch(e.data.action),
            },
            {
              text: "Continuar editando",
              style: "cancel",
            },
          ]
        );
      });
      return unsubscribe;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation, nombre, intereses, avatarLocal, fotoEliminada]);

    /** Añade o quita un interés de la selección actual. */
    const toggleInteres = (clave: string) => {
      if (intereses.includes(clave)) {
        setIntereses(intereses.filter((i) => i !== clave));
      } else {
        setIntereses([...intereses, clave]);
      }
    };

    /** Abre la galería del dispositivo para escoger una nueva foto de perfil. */
    const handlePickAvatar = async () => {
      // En Android 13+ los permisos de galería son granulares y hay que
      // pedirlos explícitamente, si no el picker falla en silencio.
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso necesario",
          "Para cambiar tu foto necesitamos acceso a la galería. Actívalo desde los ajustes del móvil."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarLocal(result.assets[0].uri);
        // Si había marcado quitar la foto y ahora elige una, se cancela
        setFotoEliminada(false);
      }
    };

    /** Marca la foto de perfil para borrarla; el cambio se aplica al guardar. */
    const handleQuitarFoto = () => {
      setAvatarLocal(null);
      setFotoEliminada(true);
    };

    /**
     * Valida el formulario y guarda los cambios. Si hay avatar nuevo lo sube
     * a Cloudinary; si el usuario quitó la foto, guarda fotoPerfil como null.
     */
    const handleGuardar = async () => {
      if (!nombre.trim()) {
        Alert.alert("Error", "El nombre no puede estar vacío");
        return;
      }

      // Si hay avatar nuevo, subirlo primero
      if (avatarLocal) {
        const url = await usuarioVM.cambiarAvatar(userId, avatarLocal);
        if (!url) {
          Alert.alert(
            "Error",
            "No se pudo subir la imagen. Inténtalo de nuevo."
          );
          return;
        }
      }

      // Guardar nombre e intereses. Si se ha quitado la foto (y no se ha
      // elegido otra), mandamos fotoPerfil a null para borrarla en Firestore.
      const datosPerfil: {
        nombre: string;
        intereses: string[];
        fotoPerfil?: string | null;
      } = {
        nombre: nombre.trim(),
        intereses,
      };
      if (fotoEliminada && !avatarLocal) {
        datosPerfil.fotoPerfil = null;
      }
      const exito = await usuarioVM.actualizarPerfil(userId, datosPerfil);

      if (exito) {
        guardandoOk.current = true;
        navigation.goBack();
      } else {
        Alert.alert(
          "Error",
          usuarioVM.mensajeError || "No se pudo guardar el perfil"
        );
      }
    };

    // Imagen a mostrar en el avatar: preview de subida > foto guardada, salvo
    // que el usuario la haya quitado > inicial como fallback.
    const avatarUrl =
      avatarLocal || (fotoEliminada ? null : usuario?.fotoPerfil) || null;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── Cabecera ─── */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleBox}>
              <Text style={styles.title}>Editar perfil</Text>
              <Text style={styles.subtitle}>Personaliza tu cuenta</Text>
            </View>
            <View style={{ width: 70 }} />
          </View>

          {/* ─── Avatar ─── */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handlePickAvatar}
              activeOpacity={0.85}
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {nombre ? nombre.charAt(0).toUpperCase() : "?"}
                  </Text>
                </View>
              )}
              {/* Indicador de cámara */}
              <View style={styles.cameraIcon}>
                <Text style={styles.cameraEmoji}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Toca para cambiar la foto</Text>
            {avatarUrl && (
              <TouchableOpacity
                onPress={handleQuitarFoto}
                activeOpacity={0.7}
                style={styles.quitarFotoBtn}
              >
                <Text style={styles.quitarFotoText}>Quitar foto</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ─── Nombre ─── */}
          <Input
            label="Nombre"
            placeholder="Tu nombre visible en la app"
            value={nombre}
            onChangeText={setNombre}
            required
          />

          {/* ─── Cuenta (email readonly) ─── */}
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.readonlyBox}>
            <View style={styles.readonlyRow}>
              <Text style={styles.readonlyLabel}>Email</Text>
              <Text style={styles.readonlyValue} numberOfLines={1}>
                {userEmail || "—"}
              </Text>
            </View>
            <Text style={styles.readonlyHint}>
              🔒 Este dato no se puede cambiar aquí
            </Text>
          </View>

          {/* ─── Intereses ─── */}
          <Text style={styles.sectionTitle}>Intereses</Text>
          <Text style={styles.sectionHint}>
            Selecciona los tipos de manualidades que te gustan
          </Text>
          <View style={styles.chipRow}>
            {INTERESES_DISPONIBLES.map((interes) => {
              const seleccionado = intereses.includes(interes.key);
              return (
                <TouchableOpacity
                  key={interes.key}
                  style={[styles.chip, seleccionado && styles.chipSelected]}
                  onPress={() => toggleInteres(interes.key)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.chipEmoji}>{interes.emoji}</Text>
                  <Text
                    style={[
                      styles.chipText,
                      seleccionado && styles.chipTextSelected,
                    ]}
                  >
                    {interes.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ─── Botón guardar ─── */}
          <Button
            title="Guardar cambios"
            onPress={handleGuardar}
            loading={usuarioVM.isSaving}
            style={styles.saveBtn}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  // Cabecera
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
    paddingTop: SPACING.md,
  },
  cancelText: {
    fontSize: 15,
    color: COLORS.textMid,
    fontWeight: "600",
    width: 70,
  },
  headerTitleBox: {
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  // Avatar
  avatarSection: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  avatarImage: {
    width: "100%" as any,
    height: "100%" as any,
    borderRadius: RADIUS.full,
  },
  avatarPlaceholder: {
    width: "100%" as any,
    height: "100%" as any,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.full,
  },
  avatarInitial: {
    color: COLORS.white,
    fontSize: 44,
    fontWeight: "800",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  cameraEmoji: {
    fontSize: 18,
  },
  avatarHint: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  quitarFotoBtn: {
    marginTop: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  quitarFotoText: {
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: "700",
  },
  // Section titles (consistente con otras pantallas)
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
  // Readonly box (cuenta)
  readonlyBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
  },
  readonlyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  readonlyLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  readonlyValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  readonlyHint: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    fontStyle: "italic",
  },
  // Chips
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMid,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  saveBtn: {
    marginTop: SPACING.md,
  },
});
