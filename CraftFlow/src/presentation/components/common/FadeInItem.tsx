import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

interface FadeInItemProps {
  /** Índice del ítem en la lista. Se usa para calcular el delay escalonado. */
  index: number;
  /** Contenido a animar */
  children: React.ReactNode;
  /** Delay entre ítems en ms. Por defecto 50ms. */
  stagger?: number;
  /** Duración total de la animación en ms. Por defecto 300ms. */
  duration?: number;
}

/**
 * Wrapper que hace aparecer su contenido con un fade-in + slide-up sutil.
 *
 * Pensado para usarse dentro de renderItem de FlatList/SectionList:
 * el parámetro index activa un delay escalonado para crear el típico
 * efecto de "entrada cascada" donde los elementos aparecen uno tras otro.
 *
 * El delay se limita a 500ms para que las listas largas no tarden
 * demasiado en terminar de animar los primeros elementos visibles.
 */
export const FadeInItem: React.FC<FadeInItemProps> = ({
  index,
  children,
  stagger = 50,
  duration = 300,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Limitar el delay acumulado para que listas largas no tarden demasiado
    const delay = Math.min(index * stagger, 500);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};
