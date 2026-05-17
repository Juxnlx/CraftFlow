import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { observer } from "mobx-react-lite";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { InventoryStackParamList } from "../../../presentation/navigation/MainNavigator";
import { auth } from "../../../config/firebaseConfig";
import { materialVM, herramientaVM } from "../../../presentation/viewmodels";
import { Button } from "../../../presentation/components/common/Button";
import { Input } from "../../../presentation/components/common/Input";
import { Material, CategoriaType } from "../../../domain/entities/Material";
import { Herramienta } from "../../../domain/entities/Herramienta";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";

/** Props inyectadas por React Navigation a la pantalla de añadir/editar */
type AddEditMaterialScreenProps = {
  navigation: NativeStackNavigationProp<
    InventoryStackParamList,
    "AddEditMaterial"
  >;
  route: RouteProp<InventoryStackParamList, "AddEditMaterial">;
};

/** Categoría del selector: las del dominio + "herramienta" */
type CategoriaExtendida = CategoriaType | "herramienta";

// Todas las categorías disponibles en el selector (incluyendo herramientas)
const CATEGORIAS_SELECTOR: {
  key: CategoriaExtendida;
  emoji: string;
  label: string;
}[] = [
  { key: "lana", emoji: "🧶", label: "Lana / Hilo" },
  { key: "pintura", emoji: "🎨", label: "Pintura" },
  { key: "ceramica", emoji: "🏺", label: "Cerámica / Arcilla" },
  { key: "tela", emoji: "🧵", label: "Tela / Tejido" },
  { key: "papel", emoji: "📄", label: "Papel / Cartón" },
  { key: "herramienta", emoji: "✂️", label: "Herramientas" },
];

// Campos dinámicos por categoría de material.
// Las medidas (metros, mililitros, kilogramos, unidades) se entienden POR UNIDAD:
// el motor de recomendaciones multiplica este valor por la cantidad del
// inventario para calcular el total disponible del usuario.
const CAMPOS_CATEGORIA: Record<
  CategoriaType,
  { key: string; label: string; keyboard: string; placeholder: string }[]
> = {
  lana: [
    { key: "grosor", label: "Grosor (mm)", keyboard: "decimal-pad", placeholder: "Ej: 4" },
    { key: "metros", label: "Metros por unidad", keyboard: "numeric", placeholder: "Ej: 120" },
    { key: "tipoMaterial", label: "Tipo de material", keyboard: "default", placeholder: "Ej: Algodón, Acrílico..." },
  ],
  pintura: [
    { key: "mililitros", label: "Mililitros por unidad", keyboard: "numeric", placeholder: "Ej: 250" },
    { key: "tipoMaterial", label: "Tipo de material", keyboard: "default", placeholder: "Ej: Acrílica, Óleo..." },
  ],
  ceramica: [
    { key: "kilogramos", label: "Kilogramos por unidad", keyboard: "decimal-pad", placeholder: "Ej: 2.5" },
    { key: "tipoMaterial", label: "Tipo de material", keyboard: "default", placeholder: "Ej: Barro rojo, Gres..." },
  ],
  tela: [
    { key: "metros", label: "Metros por unidad", keyboard: "decimal-pad", placeholder: "Ej: 1.5" },
    { key: "tipoMaterial", label: "Tipo de material", keyboard: "default", placeholder: "Ej: Algodón, Lino..." },
  ],
  papel: [
    { key: "unidades", label: "Unidades", keyboard: "numeric", placeholder: "Ej: 20" },
    { key: "tipoMaterial", label: "Tipo de material", keyboard: "default", placeholder: "Ej: Cartulina, Kraft..." },
  ],
};

// Placeholders personalizados por categoría para los campos comunes
const PLACEHOLDERS_COMUNES: Record<
  CategoriaExtendida,
  { nombre: string; color: string; precio: string }
> = {
  lana: { nombre: "Ej: Ovillo algodón verde", color: "Ej: Verde menta", precio: "Ej: 3.50" },
  pintura: { nombre: "Ej: Acrílico azul cobalto", color: "Ej: Azul cobalto", precio: "Ej: 4.20" },
  ceramica: { nombre: "Ej: Arcilla roja", color: "Ej: Rojo terracota", precio: "Ej: 8.00" },
  tela: { nombre: "Ej: Algodón estampado flores", color: "Ej: Beige con flores", precio: "Ej: 6.50" },
  papel: { nombre: "Ej: Cartulina A4 blanca", color: "Ej: Blanco", precio: "Ej: 2.00" },
  herramienta: { nombre: "Ej: Aguja crochet 3.5mm", color: "", precio: "" },
};

/** Snapshot de los valores del formulario para detectar cambios sin guardar */
interface FormSnapshot {
  nombre: string;
  color: string;
  precio: string;
  urlCompra: string;
  propiedades: Record<string, string>;
  tipoHerramienta: string;
  cantidad: string;
}

/**
 * Normaliza una URL añadiéndole "https://" si el usuario no escribió
 * protocolo (p.ej. "tiendamaterial.com"). Devuelve null si está vacía.
 */
const normalizarUrl = (url: string): string | null => {
  const limpia = url.trim();
  if (!limpia) return null;
  if (/^https?:\/\//i.test(limpia)) return limpia;
  return `https://${limpia}`;
};

/** Serializa el snapshot para poder compararlo con `===`. */
const snapshotToString = (snap: FormSnapshot): string => JSON.stringify(snap);

/**
 * Pantalla para crear o editar un material o herramienta. En modo crear
 * usa un flujo en dos pasos (selector de categoría → formulario); en
 * modo edición salta directamente al formulario ya relleno.
 */
export const AddEditMaterialScreen = observer(
  ({ navigation, route }: AddEditMaterialScreenProps) => {
    const userId = auth.currentUser?.uid || "";
    const idEditar = route.params?.idEditar;
    const isEditing = Boolean(idEditar);

    // Estado del selector de categoría (null = paso 1, solo en modo crear)
    const [categoriaSeleccionada, setCategoriaSeleccionada] =
      useState<CategoriaExtendida | null>(null);

    // Estado del formulario
    const [nombre, setNombre] = useState("");
    const [color, setColor] = useState("");
    const [precio, setPrecio] = useState("");
    const [urlCompra, setUrlCompra] = useState("");
    const [propiedades, setPropiedades] = useState<Record<string, string>>({});

    // Campos específicos de herramienta
    const [tipoHerramienta, setTipoHerramienta] = useState("");
    const [cantidad, setCantidad] = useState("1");

    const [localError, setLocalError] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    // Snapshot original para detectar cambios
    const originalSnapshot = useRef<string>("");

    // Marca de salida intencional tras guardar: si está activa, el listener
    // beforeRemove deja pasar el goBack en lugar de volver al selector.
    const salidaIntencional = useRef(false);

    /** Resetea todos los campos del formulario para empezar uno nuevo */
    const resetearFormulario = () => {
      setNombre("");
      setColor("");
      setPrecio("");
      setUrlCompra("");
      setPropiedades({});
      setTipoHerramienta("");
      setCantidad("1");
      setLocalError(null);
    };

    const isHerramienta = categoriaSeleccionada === "herramienta";

    /** Devuelve el snapshot actual del formulario */
    const getCurrentSnapshot = (): FormSnapshot => ({
      nombre,
      color,
      precio,
      urlCompra,
      propiedades: { ...propiedades },
      tipoHerramienta,
      cantidad,
    });

    /** Comprueba si hay cambios sin guardar */
    const hasUnsavedChanges = (): boolean => {
      if (!originalSnapshot.current) return false;
      return (
        snapshotToString(getCurrentSnapshot()) !== originalSnapshot.current
      );
    };

    /** Guarda el snapshot actual como referencia original */
    const saveOriginalSnapshot = () => {
      originalSnapshot.current = snapshotToString(getCurrentSnapshot());
    };

    // Pre-rellenar datos si estamos en modo edición
    useEffect(() => {
      if (!isEditing || loaded) return;

      const material = materialVM.materiales.find((m) => m.id === idEditar);
      if (material) {
        setCategoriaSeleccionada(material.categoria);
        setNombre(material.nombre);
        setColor(material.color || "");
        setPrecio(material.precio !== null ? String(material.precio) : "");
        setUrlCompra(material.urlCompra || "");
        setCantidad(String(material.cantidad));

        const propsStr: Record<string, string> = {};
        for (const [key, val] of Object.entries(material.propiedades)) {
          propsStr[key] = String(val);
        }
        setPropiedades(propsStr);
        setLoaded(true);
        return;
      }

      const herramienta = herramientaVM.herramientas.find(
        (h) => h.id === idEditar
      );
      if (herramienta) {
        setCategoriaSeleccionada("herramienta");
        setNombre(herramienta.nombre);
        setTipoHerramienta(herramienta.tipo);
        setCantidad(String(herramienta.cantidad));
        setUrlCompra(herramienta.urlCompra || "");

        const propsStr: Record<string, string> = {};
        for (const [key, val] of Object.entries(herramienta.propiedades)) {
          propsStr[key] = String(val);
        }
        setPropiedades(propsStr);
        setLoaded(true);
      }
    }, [isEditing, idEditar, loaded]);

    // Guardar snapshot original una vez cargados los datos
    useEffect(() => {
      if (isEditing && loaded) {
        setTimeout(() => saveOriginalSnapshot(), 100);
      }
    }, [loaded]);

    // Para modo crear, guardar snapshot cuando se selecciona categoría
    useEffect(() => {
      if (!isEditing && categoriaSeleccionada) {
        saveOriginalSnapshot();
      }
    }, [categoriaSeleccionada]);

    /** Actualiza una sola clave del objeto `propiedades`. */
    const updatePropiedad = (key: string, value: string) => {
      setPropiedades((prev) => ({ ...prev, [key]: value }));
    };

    /** Restaura los datos al estado original */
    const restoreOriginalData = () => {
      if (!originalSnapshot.current) return;
      const original: FormSnapshot = JSON.parse(originalSnapshot.current);
      setNombre(original.nombre);
      setColor(original.color);
      setPrecio(original.precio);
      setUrlCompra(original.urlCompra);
      setPropiedades(original.propiedades);
      setTipoHerramienta(original.tipoHerramienta);
      setCantidad(original.cantidad);
    };

    // Refs para que el listener de beforeRemove (estable) siempre llame
    // a las funciones con el estado más reciente sin re-suscribirse.
    const handlersRef = useRef({
      hasUnsavedChanges,
      restoreOriginalData,
      handleGuardar: (_shouldNavigate?: boolean): Promise<boolean> =>
        Promise.resolve(false),
    });
    handlersRef.current.hasUnsavedChanges = hasUnsavedChanges;
    handlersRef.current.restoreOriginalData = restoreOriginalData;

    // Ref con el estado actual del formulario para que el listener pueda
    // detectar si hay datos rellenos sin necesidad de re-suscribirse en
    // cada cambio de campo.
    const formStateRef = useRef({
      nombre,
      color,
      precio,
      urlCompra,
      tipoHerramienta,
      propiedades,
    });
    formStateRef.current = {
      nombre,
      color,
      precio,
      urlCompra,
      tipoHerramienta,
      propiedades,
    };

    /**
     * Intercepta cualquier intento de salir: botón ← del header,
     * botón Cancelar, back físico de Android y swipe-back de iOS.
     *
     * Dos casos especiales:
     *  - Modo crear en paso 2: vuelve al selector de categoría (paso 1).
     *  - Modo edición con cambios sin guardar: pregunta si guardar.
     */
    useEffect(() => {
      const unsubscribe = navigation.addListener("beforeRemove", (e) => {
        // Si acabamos de guardar y disparamos el goBack, dejar pasar.
        if (salidaIntencional.current) {
          salidaIntencional.current = false;
          return;
        }
        if (!isEditing && categoriaSeleccionada) {
          // Si el usuario ya escribió algo en el formulario, avisamos antes
          // de volver al selector de categoría (perdería los datos).
          const f = formStateRef.current;
          const tieneDatos =
            !!f.nombre.trim() ||
            !!f.color.trim() ||
            !!f.precio.trim() ||
            !!f.urlCompra.trim() ||
            !!f.tipoHerramienta.trim() ||
            Object.values(f.propiedades).some((v) => v.trim());
          if (!tieneDatos) {
            e.preventDefault();
            setCategoriaSeleccionada(null);
            resetearFormulario();
            return;
          }
          e.preventDefault();
          Alert.alert(
            "¿Salir sin guardar?",
            "Vas a perder lo que llevas escrito.",
            [
              {
                text: "Salir",
                style: "destructive",
                onPress: () => {
                  setCategoriaSeleccionada(null);
                  resetearFormulario();
                },
              },
              { text: "Continuar editando", style: "cancel" },
            ]
          );
          return;
        }
        if (isEditing && handlersRef.current.hasUnsavedChanges()) {
          e.preventDefault();
          Alert.alert("Cambios sin guardar", "¿Quieres guardar los cambios?", [
            {
              text: "No",
              style: "destructive",
              onPress: () => {
                handlersRef.current.restoreOriginalData();
                navigation.dispatch(e.data.action);
              },
            },
            {
              text: "Sí",
              onPress: async () => {
                const ok = await handlersRef.current.handleGuardar(false);
                if (ok) navigation.dispatch(e.data.action);
              },
            },
          ]);
        }
      });
      return unsubscribe;
    }, [navigation, isEditing, categoriaSeleccionada]);

    /**
     * Valida los campos y guarda el material o herramienta. Si `shouldNavigate`
     * es true (el caso normal), vuelve atrás al terminar; cuando se llama
     * desde el diálogo de "cambios sin guardar" pasamos false para no
     * encadenar dos goBack seguidos.
     */
    const handleGuardar = async (
      shouldNavigate: boolean = true
    ): Promise<boolean> => {
      if (!nombre.trim()) {
        setLocalError("El nombre es obligatorio");
        return false;
      }

      setLocalError(null);

      if (isHerramienta) {
        if (!tipoHerramienta.trim()) {
          setLocalError("El tipo de herramienta es obligatorio");
          return false;
        }

        const propsFinales: Record<string, string | number> = {};
        for (const [key, val] of Object.entries(propiedades)) {
          if (val.trim()) {
            const numVal = Number(val);
            propsFinales[key] = isNaN(numVal) ? val : numVal;
          }
        }

        if (isEditing && idEditar) {
          const success = await herramientaVM.actualizarHerramienta(idEditar, {
            nombre: nombre.trim(),
            tipo: tipoHerramienta.trim(),
            propiedades: propsFinales,
            cantidad: parseInt(cantidad) || 1,
            urlCompra: normalizarUrl(urlCompra),
          } as Partial<Herramienta>);
          if (success) {
            saveOriginalSnapshot();
            if (shouldNavigate) navigation.goBack();
          }
          return success;
        } else {
          const herramienta = new Herramienta(
            "",
            userId,
            nombre.trim(),
            tipoHerramienta.trim(),
            propsFinales,
            parseInt(cantidad) || 1,
            normalizarUrl(urlCompra)
          );
          const success = await herramientaVM.crearHerramienta(herramienta);
          if (success) {
            salidaIntencional.current = true;
            navigation.goBack();
          }
          return success;
        }
      } else {
        const categoria = categoriaSeleccionada as CategoriaType;

        const propsFinales: Record<string, string | number> = {};
        for (const [key, val] of Object.entries(propiedades)) {
          if (val.trim()) {
            const numVal = Number(val);
            propsFinales[key] = isNaN(numVal) ? val : numVal;
          }
        }

        if (isEditing && idEditar) {
          const success = await materialVM.actualizarMaterial(idEditar, {
            nombre: nombre.trim(),
            color: color.trim() || null,
            precio: precio.trim() ? parseFloat(precio) : null,
            propiedades: propsFinales,
            urlCompra: normalizarUrl(urlCompra),
            cantidad: parseInt(cantidad) || 1,
          } as Partial<Material>);
          if (success) {
            saveOriginalSnapshot();
            if (shouldNavigate) navigation.goBack();
          }
          return success;
        } else {
          const material = new Material(
            "",
            userId,
            nombre.trim(),
            categoria,
            color.trim() || null,
            precio.trim() ? parseFloat(precio) : null,
            null,
            propsFinales,
            new Date(),
            normalizarUrl(urlCompra),
            parseInt(cantidad) || 1
          );
          const success = await materialVM.crearMaterial(material);
          if (success) {
            salidaIntencional.current = true;
            navigation.goBack();
          }
          return success;
        }
      }
    };

    handlersRef.current.handleGuardar = handleGuardar;

    // Obtener la info de la categoría seleccionada
    const catInfo = categoriaSeleccionada
      ? CATEGORIAS_SELECTOR.find((c) => c.key === categoriaSeleccionada)
      : null;

    // Título y subtítulo dinámicos según el estado
    const tituloHeader = isEditing
      ? isHerramienta
        ? "Editar herramienta"
        : "Editar material"
      : !categoriaSeleccionada
      ? "Nuevo ítem"
      : isHerramienta
      ? "Nueva herramienta"
      : "Nuevo material";

    const subtituloHeader = !categoriaSeleccionada && !isEditing
      ? "Elige una categoría"
      : "Completa los datos";

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
              <Text style={styles.title}>{tituloHeader}</Text>
              <Text style={styles.subtitle}>{subtituloHeader}</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* ═══ PASO 1: Selector de categoría ═══ */}
          {!categoriaSeleccionada ? (
            <View style={styles.paso1Container}>
              <Text style={styles.paso1Title}>¿Qué quieres añadir?</Text>
              <Text style={styles.paso1Hint}>
                Elige una categoría para empezar
              </Text>
              {CATEGORIAS_SELECTOR.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={styles.categoryButton}
                  onPress={() => setCategoriaSeleccionada(cat.key)}
                  activeOpacity={0.8}
                >
                  <View style={styles.categoryEmojiBox}>
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                  </View>
                  <Text style={styles.categoryArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            /* ═══ PASO 2: Formulario ═══ */
            <View>
              {/* Badge de categoría seleccionada */}
              <View style={styles.categoryBadge}>
                <View style={styles.categoryBadgeEmojiBox}>
                  <Text style={styles.categoryBadgeEmoji}>{catInfo?.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryBadgeLabel}>Categoría</Text>
                  <Text style={styles.categoryBadgeName}>{catInfo?.label}</Text>
                </View>
                {!isEditing && (
                  <TouchableOpacity
                    onPress={() => setCategoriaSeleccionada(null)}
                  >
                    <Text style={styles.categoryBadgeChange}>Cambiar →</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* ─── Información básica ─── */}
              <Text style={styles.sectionTitle}>Información básica</Text>
              <Input
                label="Nombre"
                placeholder={PLACEHOLDERS_COMUNES[categoriaSeleccionada].nombre}
                value={nombre}
                onChangeText={(text) => {
                  setNombre(text);
                  setLocalError(null);
                }}
                required
              />

              {/* Campos de herramienta */}
              {isHerramienta && (
                <>
                  <Input
                    label="Tipo"
                    placeholder="Ej: Agujas de crochet, Pinceles, Tijeras..."
                    value={tipoHerramienta}
                    onChangeText={setTipoHerramienta}
                    required
                  />
                  <Input
                    label="Cantidad"
                    placeholder="1"
                    value={cantidad}
                    onChangeText={setCantidad}
                    keyboardType="numeric"
                  />
                </>
              )}

              {/* Campos de material */}
              {!isHerramienta && (
                <>
                  <Input
                    label="Color"
                    placeholder={
                      PLACEHOLDERS_COMUNES[categoriaSeleccionada].color
                    }
                    value={color}
                    onChangeText={setColor}
                  />
                  <Input
                    label="Precio (€)"
                    placeholder={
                      PLACEHOLDERS_COMUNES[categoriaSeleccionada].precio
                    }
                    value={precio}
                    onChangeText={setPrecio}
                    keyboardType="decimal-pad"
                  />
                  {/* Para papel ya hay "Unidades" en propiedades; evitamos
                      duplicar el concepto ocultando aquí Cantidad. */}
                  {categoriaSeleccionada !== "papel" && (
                    <Input
                      label="Cantidad"
                      placeholder="1"
                      value={cantidad}
                      onChangeText={setCantidad}
                      keyboardType="numeric"
                    />
                  )}
                </>
              )}

              {/* ─── Detalles de la categoría ─── */}
              {!isHerramienta &&
                categoriaSeleccionada &&
                CAMPOS_CATEGORIA[categoriaSeleccionada as CategoriaType] && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      Detalles de {catInfo?.label}
                    </Text>
                    {CAMPOS_CATEGORIA[
                      categoriaSeleccionada as CategoriaType
                    ].map((campo) => (
                      <Input
                        key={campo.key}
                        label={campo.label}
                        placeholder={campo.placeholder}
                        value={propiedades[campo.key] || ""}
                        onChangeText={(text) =>
                          updatePropiedad(campo.key, text)
                        }
                        keyboardType={campo.keyboard as any}
                      />
                    ))}
                  </View>
                )}

              {/* ─── Enlace de compra ─── */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Enlace de compra</Text>
                <Text style={styles.sectionHint}>
                  Guarda dónde lo compraste para poder reponerlo fácilmente
                </Text>
                <Input
                  label="URL"
                  placeholder="Ej: https://tiendamaterial.com/producto"
                  value={urlCompra}
                  onChangeText={setUrlCompra}
                  keyboardType="url"
                />
              </View>

              {localError && <Text style={styles.error}>{localError}</Text>}

              {/* ─── Acciones ─── */}
              <View style={styles.actions}>
                <Button
                  title={
                    isEditing ? "Guardar cambios" : "Añadir al inventario"
                  }
                  onPress={async () => {
                    await handleGuardar();
                  }}
                  loading={materialVM.isLoading || herramientaVM.isLoading}
                  style={styles.saveButton}
                />
                <Button
                  title="Cancelar"
                  onPress={() => navigation.goBack()}
                  variant="outline"
                />
              </View>
            </View>
          )}
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
  },
  // Paso 1
  paso1Container: {
    marginTop: SPACING.sm,
  },
  paso1Title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  paso1Hint: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  categoryEmojiBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgWarm,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  categoryArrow: {
    fontSize: 20,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  // Paso 2 - Badge de categoría
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm + 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  categoryBadgeEmojiBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgWarm,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBadgeEmoji: {
    fontSize: 24,
  },
  categoryBadgeLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoryBadgeName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 2,
  },
  categoryBadgeChange: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
  },
  // Secciones (titles estilo iOS)
  section: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMid,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  // Error
  error: {
    color: COLORS.danger,
    textAlign: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    fontWeight: "600",
  },
  // Acciones
  actions: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  saveButton: {
    marginBottom: 0,
  },
});
