import React, { useEffect, useRef, useState } from "react";
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
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ProfileStackParamList } from "../../../presentation/navigation/MainNavigator";
import { auth } from "../../../config/firebaseConfig";
import { proyectoVM } from "../../../presentation/viewmodels";
import { container } from "../../../core/container";
import { TYPES } from "../../../core/types";
import { IUploadImageUseCase } from "../../../domain/interfaces/usecases/IStorageUseCases";
import { Button } from "../../../presentation/components/common/Button";
import { Input } from "../../../presentation/components/common/Input";
import {
  Proyecto,
  MaterialRequerido,
  HerramientaRequerida,
  PasoProyecto,
  Dificultad,
} from "../../../domain/entities/Proyecto";
import { ProyectoValidator } from "../../../domain/services/ProyectoValidator";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";
import * as ImagePicker from "expo-image-picker";

/** Props inyectadas por React Navigation a la pantalla de crear/editar proyecto */
type CreateProjectScreenProps = {
  navigation: NativeStackNavigationProp<
    ProfileStackParamList,
    "CreateProject"
  >;
  route: RouteProp<ProfileStackParamList, "CreateProject">;
};

// Niveles de dificultad con estrellas acumulativas para que el usuario
// perciba la complejidad a simple vista.
const DIFICULTADES: { key: Dificultad; label: string; estrellas: string }[] = [
  { key: "facil", label: "Fácil", estrellas: "⭐" },
  { key: "intermedio", label: "Intermedio", estrellas: "⭐⭐" },
  { key: "avanzado", label: "Avanzado", estrellas: "⭐⭐⭐" },
];

// Categorías cerradas: deben coincidir con los filtros de ExploreScreen
// para que un proyecto creado aquí sea localizable allí. Solo se permite
// una por proyecto para evitar duplicados al filtrar.
const CATEGORIAS: { value: string; label: string; emoji: string }[] = [
  { value: "Crochet", label: "Crochet", emoji: "🧶" },
  { value: "Cerámica", label: "Cerámica", emoji: "🏺" },
  { value: "Pintura", label: "Pintura", emoji: "🎨" },
  { value: "Costura", label: "Costura", emoji: "🧵" },
  { value: "Papel", label: "Papel", emoji: "📄" },
];

// Categorías cerradas para los materiales requeridos del proyecto.
// Deben coincidir EXACTAMENTE con las del inventario (AddEditMaterialScreen)
// para que el motor de recomendaciones pueda matchear sin ambigüedades.
const CATEGORIAS_MATERIAL: {
  value: string;
  label: string;
  emoji: string;
  etiqueta: string;
}[] = [
  { value: "lana", label: "Lana / Hilo", emoji: "🧶", etiqueta: "Metros necesarios" },
  { value: "pintura", label: "Pintura", emoji: "🎨", etiqueta: "Mililitros necesarios" },
  { value: "ceramica", label: "Cerámica / Arcilla", emoji: "🏺", etiqueta: "Kilos necesarios" },
  { value: "tela", label: "Tela / Tejido", emoji: "🧵", etiqueta: "Metros necesarios" },
  { value: "papel", label: "Papel / Cartón", emoji: "📄", etiqueta: "Hojas necesarias" },
];

/** Devuelve la etiqueta de cantidad apropiada para la categoría del material. */
const cantidadLabel = (categoria: string | null): string => {
  if (!categoria) {
    return "Cantidad necesaria";
  }
  const cat = CATEGORIAS_MATERIAL.find((c) => c.value === categoria);
  return cat?.etiqueta ?? "Cantidad necesaria";
};

/**
 * Pantalla para crear o editar un proyecto: imagen, datos básicos,
 * materiales, herramientas y pasos. En modo edición recibe `idEditar`
 * y pre-rellena el formulario con los datos existentes.
 */
export const CreateProjectScreen = observer(
  ({ navigation, route }: CreateProjectScreenProps) => {
    const userId = auth.currentUser?.uid || "";
    const idEditar = route.params?.idEditar;
    const isEditing = Boolean(idEditar);

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [dificultad, setDificultad] = useState<Dificultad | null>(null);
    const [visibilidad, setVisibilidad] = useState<"publico" | "privado">(
      "publico"
    );
    const [categoria, setCategoria] = useState<string | null>(null);
    const [materiales, setMateriales] = useState<MaterialRequerido[]>([]);
    const [herramientas, setHerramientas] = useState<HerramientaRequerida[]>(
      []
    );
    const [pasos, setPasos] = useState<PasoProyecto[]>([]);
    const [imagenUri, setImagenUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    // Snapshot serializado del formulario al cargar, para detectar
    // cambios sin guardar al volver atrás o cancelar (solo en edición).
    const originalSnapshot = useRef<string>("");

    // Marca de salida intencional tras guardar: cuando está activa, el
    // listener beforeRemove deja pasar el goBack sin volver a preguntar
    // (si no, se mostraría el popup "salir sin guardar" después de crear
    // el proyecto y, al pulsar continuar, se duplicaría la creación).
    const salidaIntencional = useRef(false);

    /** Serializa el estado actual del formulario para poder compararlo. */
    const getCurrentSnapshot = () =>
      JSON.stringify({
        nombre,
        descripcion,
        dificultad,
        visibilidad,
        categoria,
        materiales,
        herramientas,
        pasos,
        imagenUri,
      });

    /** Indica si el usuario ha modificado algo desde la última carga. */
    const hasUnsavedChanges = (): boolean => {
      if (!originalSnapshot.current) {
        return false;
      }
      return getCurrentSnapshot() !== originalSnapshot.current;
    };

    /** Guarda el snapshot actual como referencia para futuras comparaciones. */
    const saveOriginalSnapshot = () => {
      originalSnapshot.current = getCurrentSnapshot();
    };

    /** Restaura todos los campos al estado guardado en el snapshot original. */
    const restoreOriginalData = () => {
      if (!originalSnapshot.current) {
        return;
      }
      const o = JSON.parse(originalSnapshot.current);
      setNombre(o.nombre);
      setDescripcion(o.descripcion);
      setDificultad(o.dificultad);
      setVisibilidad(o.visibilidad);
      setCategoria(o.categoria);
      setMateriales(o.materiales);
      setHerramientas(o.herramientas);
      setPasos(o.pasos);
      setImagenUri(o.imagenUri);
    };

    // Pre-rellenar formulario en modo edición desde el proyecto cargado.
    useEffect(() => {
      if (!isEditing || loaded) {
        return;
      }
      const proyecto = proyectoVM.misProyectos.find((p) => p.id === idEditar);
      if (!proyecto) {
        return;
      }
      setNombre(proyecto.nombre);
      setDescripcion(proyecto.descripcion);
      setDificultad(proyecto.dificultad);
      setVisibilidad(proyecto.visibilidad);
      setCategoria(proyecto.etiquetas[0] || null);
      setMateriales(proyecto.materiales.map((m) => ({ ...m })));
      setHerramientas(proyecto.herramientas.map((h) => ({ ...h })));
      setPasos(proyecto.pasos.map((p) => ({ ...p })));
      setImagenUri(proyecto.imagen);
      setLoaded(true);
    }, [isEditing, idEditar, loaded]);

    // Una vez cargados los datos en edición, fijar el snapshot original.
    // El timeout asegura que los setState anteriores ya se han aplicado.
    useEffect(() => {
      if (isEditing && loaded) {
        setTimeout(() => saveOriginalSnapshot(), 100);
      }
    }, [loaded]);

    // En modo creación guardamos un snapshot vacío al montar para que
    // hasUnsavedChanges detecte cualquier campo añadido y avise al salir.
    useEffect(() => {
      if (!isEditing) {
        saveOriginalSnapshot();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Materiales ───
    /** Añade un material vacío al final de la lista. */
    const addMaterial = () => {
      setMateriales([
        ...materiales,
        { nombre: "", categoria: "", cantidad: null },
      ]);
    };

    /** Actualiza un campo concreto de un material en la posición indicada. */
    const updateMaterial = (
      index: number,
      field: keyof MaterialRequerido,
      value: string
    ) => {
      const updated = [...materiales];
      (updated[index] as any)[field] = value || null;
      setMateriales(updated);
    };

    /** Elimina el material en la posición indicada. */
    const removeMaterial = (index: number) => {
      setMateriales(materiales.filter((_, i) => i !== index));
    };

    // ─── Herramientas ───
    /** Añade una herramienta vacía al final de la lista. */
    const addHerramienta = () => {
      setHerramientas([...herramientas, { nombre: "", tipo: "" }]);
    };

    /** Actualiza un campo de la herramienta en la posición indicada. */
    const updateHerramienta = (
      index: number,
      field: keyof HerramientaRequerida,
      value: string
    ) => {
      const updated = [...herramientas];
      updated[index][field] = value;
      setHerramientas(updated);
    };

    /** Elimina la herramienta en la posición indicada. */
    const removeHerramienta = (index: number) => {
      setHerramientas(herramientas.filter((_, i) => i !== index));
    };

    // ─── Pasos ───
    /** Añade un paso vacío al final, asignándole el número de orden siguiente. */
    const addPaso = () => {
      setPasos([
        ...pasos,
        { numeroOrden: pasos.length + 1, descripcion: "", imagen: null },
      ]);
    };

    /** Actualiza la descripción del paso en la posición indicada. */
    const updatePaso = (index: number, descripcion: string) => {
      const updated = [...pasos];
      updated[index].descripcion = descripcion;
      setPasos(updated);
    };

    /** Elimina el paso indicado y renumera los restantes. */
    const removePaso = (index: number) => {
      const updated = pasos
        .filter((_, i) => i !== index)
        .map((p, i) => ({ ...p, numeroOrden: i + 1 }));
      setPasos(updated);
    };

    /** Abre la galería del dispositivo para escoger la imagen principal del proyecto. */
    const handlePickImage = async () => {
      // En Android 13+ los permisos de galería son granulares y hay que
      // pedirlos explícitamente, si no el picker falla en silencio.
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso necesario",
          "Para añadir una foto necesitamos acceso a la galería. Actívalo desde los ajustes del móvil."
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
        setImagenUri(result.assets[0].uri);
      }
    };

    /**
     * Valida los campos obligatorios, sube la imagen si es nueva y
     * crea o actualiza el proyecto. `shouldNavigate` se pone a false
     * cuando se llama desde el diálogo de cambios sin guardar.
     */
    const handlePublicar = async (
      shouldNavigate: boolean = true
    ): Promise<boolean> => {
      // Las reglas de validación viven en el dominio (ProyectoValidator);
      // la vista solo las invoca y muestra el resultado.
      const errorValidacion = ProyectoValidator.validar({
        nombre,
        descripcion,
        categoria,
        materiales,
        pasos,
      });
      if (errorValidacion) {
        setLocalError(errorValidacion);
        return false;
      }

      setLocalError(null);

      // Si la imagen es una URI local nueva (no http), subirla a Cloudinary.
      // Si es una URL ya remota, se reutiliza tal cual sin volver a subir.
      let imagenUrl: string | null = imagenUri;
      const esUriLocal = imagenUri && !/^https?:\/\//i.test(imagenUri);
      if (esUriLocal) {
        try {
          setIsUploading(true);
          const uploadUseCase = container.get<IUploadImageUseCase>(
            TYPES.IUploadImageUseCase
          );
          const resultado = await uploadUseCase.execute(imagenUri!, "proyectos");
          imagenUrl = resultado.url;
        } catch {
          setLocalError("Error al subir la imagen. Inténtalo de nuevo.");
          setIsUploading(false);
          return false;
        } finally {
          setIsUploading(false);
        }
      }

      const materialesLimpios = materiales.filter((m) => m.nombre.trim());
      const herramientasLimpias = herramientas.filter((h) => h.nombre.trim());
      const pasosLimpios = pasos.filter((p) => p.descripcion.trim());
      const etiquetasFinales = categoria ? [categoria] : [];

      if (isEditing && idEditar) {
        const success = await proyectoVM.actualizarProyecto(idEditar, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          imagen: imagenUrl,
          visibilidad,
          dificultad,
          etiquetas: etiquetasFinales,
          materiales: materialesLimpios,
          herramientas: herramientasLimpias,
          pasos: pasosLimpios,
        } as Partial<Proyecto>);
        if (success) {
          await proyectoVM.cargarMisProyectos(userId);
          saveOriginalSnapshot();
          if (shouldNavigate) {
            salidaIntencional.current = true;
            navigation.goBack();
          }
        }
        return success;
      }

      const proyecto = new Proyecto(
        "",
        userId,
        nombre.trim(),
        descripcion.trim(),
        imagenUrl,
        visibilidad,
        dificultad,
        etiquetasFinales,
        materialesLimpios,
        herramientasLimpias,
        pasosLimpios
      );

      const success = await proyectoVM.crearProyecto(proyecto);
      if (success) {
        await proyectoVM.cargarMisProyectos(userId);
        if (shouldNavigate) {
          salidaIntencional.current = true;
          navigation.goBack();
        }
      }
      return success;
    };

    // Refs para que el listener de beforeRemove (registrado una sola vez)
    // siempre llame a las funciones con el estado más reciente.
    const handlersRef = useRef({
      hasUnsavedChanges,
      handlePublicar,
      restoreOriginalData,
    });
    handlersRef.current = {
      hasUnsavedChanges,
      handlePublicar,
      restoreOriginalData,
    };

    /**
     * Intercepta cualquier intento de salir de la pantalla:
     * botón ← del header, botón Cancelar, back físico de Android,
     * y gesto swipe-back de iOS. Solo activo en modo edición.
     */
    useEffect(() => {
      const unsubscribe = navigation.addListener("beforeRemove", (e) => {
        // Si acabamos de guardar y lanzamos el goBack, no preguntar
        if (salidaIntencional.current) {
          salidaIntencional.current = false;
          return;
        }
        if (!handlersRef.current.hasUnsavedChanges()) {
          return;
        }
        e.preventDefault();
        const titulo = isEditing ? "Cambios sin guardar" : "¿Salir sin guardar?";
        const mensaje = isEditing
          ? "¿Quieres guardar los cambios?"
          : "Vas a perder lo que llevas escrito del proyecto.";
        Alert.alert(titulo, mensaje, [
          {
            text: isEditing ? "No" : "Salir",
            style: "destructive",
            onPress: () => {
              if (isEditing) {
                handlersRef.current.restoreOriginalData();
              }
              navigation.dispatch(e.data.action);
            },
          },
          {
            text: isEditing ? "Sí" : "Continuar editando",
            style: isEditing ? "default" : "cancel",
            onPress: async () => {
              if (!isEditing) {
                return;
              }
              const ok = await handlersRef.current.handlePublicar(false);
              if (ok) {
                navigation.dispatch(e.data.action);
              }
            },
          },
        ]);
      });
      return unsubscribe;
    }, [navigation, isEditing]);

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── Cabecera ─── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.headerTitleBox}>
              <Text style={styles.title}>
                {isEditing ? "Editar proyecto" : "Crear proyecto"}
              </Text>
              <Text style={styles.subtitle}>
                {isEditing
                  ? "Modifica los datos de tu proyecto"
                  : "Comparte tu creación con la comunidad"}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* ─── Imagen del proyecto ─── */}
          <Text style={styles.sectionTitle}>Imagen del proyecto</Text>
          <Text style={styles.sectionHint}>
            Sube una foto principal que represente tu creación
          </Text>
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={handlePickImage}
            activeOpacity={0.85}
          >
            {imagenUri ? (
              <Image source={{ uri: imagenUri }} style={styles.imagePreview} />
            ) : (
              <>
                <Text style={styles.imageIcon}>📷</Text>
                <Text style={styles.imageText}>Toca para subir imagen</Text>
                <Text style={styles.imageHint}>JPG, PNG · máx 10MB</Text>
              </>
            )}
          </TouchableOpacity>
          {imagenUri && (
            <TouchableOpacity
              style={styles.quitarFotoLink}
              onPress={() => setImagenUri(null)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
              <Text style={styles.quitarFotoLinkText}>Quitar imagen</Text>
            </TouchableOpacity>
          )}

          {/* ─── Información básica ─── */}
          <Text style={styles.sectionTitle}>Información básica</Text>
          <Input
            label="Nombre del proyecto"
            placeholder="Ej: Amigurumi Rana"
            value={nombre}
            onChangeText={setNombre}
            required
          />
          <Input
            label="Descripción"
            placeholder="Describe tu proyecto..."
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
            required
          />

          {/* ─── Dificultad ─── */}
          <Text style={styles.sectionTitle}>Dificultad</Text>
          <Text style={styles.sectionHint}>Elige el nivel del proyecto</Text>
          <View style={styles.chipRow}>
            {DIFICULTADES.map((d) => {
              const activo = dificultad === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.chip, activo && styles.chipSelected]}
                  onPress={() =>
                    setDificultad(dificultad === d.key ? null : d.key)
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.chipEstrellas}>{d.estrellas}</Text>
                  <Text
                    style={[
                      styles.chipText,
                      activo && styles.chipTextSelected,
                    ]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ─── Visibilidad ─── */}
          <Text style={styles.sectionTitle}>Visibilidad</Text>
          <Text style={styles.sectionHint}>
            ¿Quieres que otros vean este proyecto?
          </Text>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[
                styles.chip,
                visibilidad === "publico" && styles.chipSelected,
              ]}
              onPress={() => setVisibilidad("publico")}
              activeOpacity={0.85}
            >
              <Text style={styles.chipEmoji}>🌍</Text>
              <Text
                style={[
                  styles.chipText,
                  visibilidad === "publico" && styles.chipTextSelected,
                ]}
              >
                Público
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chip,
                visibilidad === "privado" && styles.chipSelected,
              ]}
              onPress={() => setVisibilidad("privado")}
              activeOpacity={0.85}
            >
              <Text style={styles.chipEmoji}>🔒</Text>
              <Text
                style={[
                  styles.chipText,
                  visibilidad === "privado" && styles.chipTextSelected,
                ]}
              >
                Privado
              </Text>
            </TouchableOpacity>
          </View>

          {/* ─── Categoría ─── */}
          <Text style={styles.sectionTitle}>Categoría</Text>
          <Text style={styles.sectionHint}>
            Elige la categoría principal del proyecto
          </Text>
          <View style={styles.chipRow}>
            {CATEGORIAS.map((c) => {
              const activo = categoria === c.value;
              return (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.chip, activo && styles.chipSelected]}
                  onPress={() =>
                    setCategoria(activo ? null : c.value)
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.chipEmoji}>{c.emoji}</Text>
                  <Text
                    style={[
                      styles.chipText,
                      activo && styles.chipTextSelected,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ─── Materiales requeridos ─── */}
          <Text style={styles.sectionTitle}>Materiales necesarios</Text>
          <Text style={styles.sectionHint}>
            Añade los materiales que se necesitan para este proyecto
          </Text>
          {materiales.map((mat, i) => (
            <View key={i} style={styles.itemCard}>
              <View style={styles.itemCardHeader}>
                <Text style={styles.itemCardLabel}>Material {i + 1}</Text>
                <TouchableOpacity
                  onPress={() => removeMaterial(i)}
                  style={styles.removeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={16} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
              <Input
                placeholder="Nombre del material"
                value={mat.nombre}
                onChangeText={(v) => updateMaterial(i, "nombre", v)}
                style={styles.itemInput}
              />
              <Text style={styles.itemFieldLabel}>Categoría</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.itemChipRow}
              >
                {CATEGORIAS_MATERIAL.map((c) => {
                  const activo = mat.categoria === c.value;
                  return (
                    <TouchableOpacity
                      key={c.value}
                      style={[styles.chip, activo && styles.chipSelected]}
                      onPress={() =>
                        updateMaterial(i, "categoria", activo ? "" : c.value)
                      }
                      activeOpacity={0.85}
                    >
                      <Text style={styles.chipEmoji}>{c.emoji}</Text>
                      <Text
                        style={[
                          styles.chipText,
                          activo && styles.chipTextSelected,
                        ]}
                      >
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <Input
                placeholder={cantidadLabel(mat.categoria)}
                value={mat.cantidad || ""}
                onChangeText={(v) => updateMaterial(i, "cantidad", v)}
                style={styles.itemInput}
                keyboardType="numeric"
              />
            </View>
          ))}
          <TouchableOpacity
            onPress={addMaterial}
            style={styles.addItemBtn}
            activeOpacity={0.85}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.addItemText}>Añadir material</Text>
          </TouchableOpacity>

          {/* ─── Herramientas requeridas ─── */}
          <Text style={styles.sectionTitle}>Herramientas necesarias</Text>
          <Text style={styles.sectionHint}>
            Herramientas que hacen falta para realizar el proyecto
          </Text>
          {herramientas.map((her, i) => (
            <View key={i} style={styles.itemCard}>
              <View style={styles.itemCardHeader}>
                <Text style={styles.itemCardLabel}>Herramienta {i + 1}</Text>
                <TouchableOpacity
                  onPress={() => removeHerramienta(i)}
                  style={styles.removeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={16} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
              <Input
                placeholder="Nombre de la herramienta"
                value={her.nombre}
                onChangeText={(v) => updateHerramienta(i, "nombre", v)}
                style={styles.itemInput}
              />
              <Input
                placeholder="Tipo (ej: Agujas de crochet)"
                value={her.tipo}
                onChangeText={(v) => updateHerramienta(i, "tipo", v)}
                style={styles.itemInput}
              />
            </View>
          ))}
          <TouchableOpacity
            onPress={addHerramienta}
            style={styles.addItemBtn}
            activeOpacity={0.85}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.addItemText}>Añadir herramienta</Text>
          </TouchableOpacity>

          {/* ─── Pasos ─── */}
          <Text style={styles.sectionTitle}>Paso a paso</Text>
          <Text style={styles.sectionHint}>
            Explica cómo se hace el proyecto de forma secuencial
          </Text>
          {pasos.map((paso, i) => (
            <View key={i} style={styles.pasoCard}>
              <View style={styles.pasoHeader}>
                <View style={styles.pasoCirculo}>
                  <Text style={styles.pasoCirculoText}>
                    {paso.numeroOrden}
                  </Text>
                </View>
                <Text style={styles.pasoLabel}>Paso {paso.numeroOrden}</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                  onPress={() => removePaso(i)}
                  style={styles.removeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={16} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
              <Input
                placeholder="Describe este paso..."
                value={paso.descripcion}
                onChangeText={(v) => updatePaso(i, v)}
                multiline
                style={styles.itemInput}
              />
            </View>
          ))}
          <TouchableOpacity
            onPress={addPaso}
            style={styles.addItemBtn}
            activeOpacity={0.85}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.addItemText}>Añadir paso</Text>
          </TouchableOpacity>

          {localError && <Text style={styles.error}>{localError}</Text>}

          {/* ─── Acciones ─── */}
          <View style={styles.actions}>
            <Button
              title={
                isUploading
                  ? "Subiendo imagen..."
                  : isEditing
                  ? "Guardar cambios"
                  : "Publicar proyecto"
              }
              onPress={() => handlePublicar()}
              loading={isUploading || proyectoVM.isLoading}
            />
            <Button
              title="Cancelar"
              onPress={() => navigation.goBack()}
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
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
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
  headerTitleBox: {
    flex: 1,
    alignItems: "center",
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
    textAlign: "center",
  },
  // Secciones
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
  // Chips
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
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
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMid,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  chipEstrellas: {
    fontSize: 12,
  },
  chipEmoji: {
    fontSize: 14,
  },
  // Tarjetas de items dinámicos (materiales / herramientas)
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 4,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  itemCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  itemCardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemInput: {
    marginBottom: SPACING.xs,
  },
  itemFieldLabel: {
    fontSize: 13,
    color: COLORS.textMid,
    fontWeight: "600",
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  itemChipRow: {
    gap: SPACING.xs,
    paddingBottom: SPACING.xs,
    paddingRight: SPACING.sm,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bgWarm,
    justifyContent: "center",
    alignItems: "center",
  },
  // Botón añadir item
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: SPACING.sm + 2,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderStyle: "dashed" as any,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  addItemText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  // Pasos
  pasoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 4,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  pasoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  pasoCirculo: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  pasoCirculoText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 15,
  },
  pasoLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  // Error
  error: {
    color: COLORS.danger,
    textAlign: "center",
    marginTop: SPACING.md,
    fontWeight: "600",
  },
  // Acciones
  actions: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  // Imagen
  imagePicker: {
    width: "100%" as any,
    height: 160,
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
});
