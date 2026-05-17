import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Image,
  Animated,
  StyleSheet,
} from "react-native";
import { COLORS, SPACING, RADIUS } from "../../../config/theme";
import { Proyecto } from "../../../domain/entities/Proyecto";

/** Props de la tarjeta de proyecto */
interface ProjectCardProps {
  /** Datos del proyecto a mostrar */
  proyecto: Proyecto;
  /** Nombre del autor a mostrar bajo el título */
  nombreAutor?: string;
  /** Porcentaje de compatibilidad para el badge de match */
  matchPercent?: number;
  /** True si el usuario tiene todos los materiales (badge verde) */
  canMake?: boolean;
  /** Estado actual del favorito (corazón lleno o vacío) */
  esFavorito?: boolean;
  /** Acción al pulsar la tarjeta */
  onPress: () => void;
  /** Acción al pulsar el icono de favorito. Si no se pasa, el icono se oculta */
  onToggleFavorito?: () => void;
  /** Si es true usa la variante reducida para el grid de Explorar */
  compact?: boolean;
}

/**
 * Tarjeta de proyecto reutilizable en feed, recomendaciones y búsqueda.
 * Tiene un modo normal y un modo compact (más pequeño, sin badges) para
 * el grid de 2 columnas. Anima un press feedback en toda la tarjeta y un
 * latido en el corazón al cambiar el favorito.
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  proyecto,
  nombreAutor,
  matchPercent,
  canMake,
  esFavorito = false,
  onPress,
  onToggleFavorito,
  compact = false,
}) => {
  // Escala para el efecto de press en toda la tarjeta
  const cardScale = useRef(new Animated.Value(1)).current;
  // Escala para el latido del corazón de favorito
  const heartScale = useRef(new Animated.Value(1)).current;

  /** Reduce ligeramente la tarjeta al iniciar el press. */
  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  /** Devuelve la tarjeta a su tamaño original al soltar. */
  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  /** Hace el "latido" en el corazón y propaga el toggle al padre. */
  const handleFavoritoPress = () => {
    // Pulse: escala rápida hacia arriba y rebote al valor original
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
        tension: 40,
      }),
    ]).start();

    onToggleFavorito?.();
  };

  return (
    <Animated.View style={{ transform: [{ scale: cardScale }] }}>
      <Pressable
        style={[styles.card, compact && styles.cardCompact]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Imagen del proyecto o placeholder */}
        <View
          style={[
            styles.imagePlaceholder,
            compact && styles.imagePlaceholderCompact,
          ]}
        >
          {proyecto.imagen ? (
            <Image
              source={{ uri: proyecto.imagen }}
              style={styles.imageReal}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.imageEmoji}>
              {proyecto.etiquetas.length > 0 ? "🎨" : "✂️"}
            </Text>
          )}

          {/* Badge "Puedes hacerlo" (izquierda) */}
          {canMake && !compact && (
            <View style={styles.canMakeBadge}>
              <Text style={styles.canMakeText}>{"✓ Puedes hacerlo"}</Text>
            </View>
          )}

          {/* Badge "X% match" (derecha) */}
          {matchPercent !== undefined && !compact && (
            <View style={styles.matchBadge}>
              <Text
                style={[
                  styles.matchText,
                  {
                    color:
                      matchPercent >= 80
                        ? COLORS.green
                        : matchPercent >= 50
                        ? COLORS.accent
                        : COLORS.textLight,
                  },
                ]}
              >
                {matchPercent}% match
              </Text>
            </View>
          )}

          {/* Botón favorito con animación de latido */}
          {onToggleFavorito && (
            <TouchableOpacity
              style={styles.favButton}
              onPress={handleFavoritoPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Animated.Text
                style={[styles.favIcon, { transform: [{ scale: heartScale }] }]}
              >
                {esFavorito ? "♥" : "♡"}
              </Animated.Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          {/* Nombre + Dificultad en la misma línea */}
          <View style={styles.nombreRow}>
            <Text
              style={[
                styles.nombre,
                compact && styles.nombreCompact,
                { flex: 1 },
              ]}
              numberOfLines={2}
            >
              {proyecto.nombre}
            </Text>
            {proyecto.dificultad && !compact && (
              <View style={styles.dificultadChip}>
                <Text style={styles.dificultadText}>{proyecto.dificultad}</Text>
              </View>
            )}
          </View>

          {/* Autor */}
          {nombreAutor && (
            <Text style={styles.autor} numberOfLines={1}>
              {nombreAutor}
            </Text>
          )}

          {/* Categorías (etiquetas) */}
          {!compact && proyecto.etiquetas.length > 0 && (
            <View style={styles.etiquetasRow}>
              {proyecto.etiquetas.slice(0, 3).map((et, i) => (
                <View key={i} style={styles.etiqueta}>
                  <Text style={styles.etiquetaText}>{et}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Cantidad de materiales */}
          {!compact && proyecto.materiales.length > 0 && (
            <Text style={styles.materialesCount}>
              {proyecto.materiales.length} material
              {proyecto.materiales.length !== 1 ? "es" : ""}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardCompact: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  imagePlaceholder: {
    height: 140,
    backgroundColor: COLORS.bgWarm,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderCompact: {
    height: 100,
  },
  imageReal: {
    width: "100%" as any,
    height: "100%" as any,
  },
  imageEmoji: {
    fontSize: 36,
  },
  canMakeBadge: {
    position: "absolute",
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.green,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.full,
  },
  canMakeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },
  matchBadge: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.full,
  },
  matchText: {
    fontSize: 12,
    fontWeight: "700",
  },
  favButton: {
    position: "absolute",
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.white,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
  },
  favIcon: {
    fontSize: 18,
    color: COLORS.danger,
  },
  info: {
    padding: SPACING.md,
  },
  nombreRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  nombre: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  nombreCompact: {
    fontSize: 15,
  },
  dificultadChip: {
    backgroundColor: COLORS.bgWarm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginTop: 2,
  },
  dificultadText: {
    fontSize: 12,
    color: COLORS.textMid,
    fontWeight: "600",
  },
  autor: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  etiquetasRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  etiqueta: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  etiquetaText: {
    fontSize: 12,
    color: COLORS.textMid,
  },
  materialesCount: {
    fontSize: 13,
    color: COLORS.textLight,
  },
});
