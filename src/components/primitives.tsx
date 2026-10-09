import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewStyle,
} from 'react-native';
import { color, font, motion, space } from '../theme';

/* ------------------------------------------------------------------ */
/* Blinking terminal cursor — mirrors the web `.blink-cursor` utility  */
/* ------------------------------------------------------------------ */
export function BlinkCursor({
  color: tone = color.text,
  style,
}: {
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), 525);
    return () => clearInterval(id);
  }, []);
  return (
    <View
      style={[
        { width: 8, height: 15, marginLeft: 2, backgroundColor: tone, opacity: on ? 1 : 0 },
        style,
      ]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Status dot with chromatic glow                                      */
/* ------------------------------------------------------------------ */
export function StatusDot({ tone, size = 8 }: { tone: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tone,
        shadowColor: tone,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 4,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Corner registration ticks — the signature bracketed panel          */
/* ------------------------------------------------------------------ */
export function CornerTicks({ tone = color.textDim, inset = -1 }: { tone?: string; inset?: number }) {
  const tick = { position: 'absolute' as const, width: 8, height: 8, backgroundColor: tone };
  return (
    <>
      <View style={[tick, { top: inset, left: inset }]} />
      <View style={[tick, { top: inset, right: inset }]} />
      <View style={[tick, { bottom: inset, left: inset }]} />
      <View style={[tick, { bottom: inset, right: inset }]} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Panel — hairline bordered surface with optional corner ticks       */
/* ------------------------------------------------------------------ */
export function Panel({
  children,
  style,
  tone = color.textDim,
  ticks = true,
  padded = true,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: string;
  ticks?: boolean;
  padded?: boolean;
}) {
  return (
    <View
      style={[
        styles.panel,
        padded && { padding: space.md },
        style,
      ]}
    >
      {ticks && <CornerTicks tone={tone} />}
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Section label — uppercase pixel eyebrow                            */
/* ------------------------------------------------------------------ */
export function SectionLabel({ children, style }: { children: React.ReactNode; style?: StyleProp<TextProps['style']> }) {
  return <Text style={[styles.sectionLabel, style]}>{children}</Text>;
}

/* ------------------------------------------------------------------ */
/* Scanline overlay — restrained 2px banding, measured to viewport    */
/* ------------------------------------------------------------------ */
export function Scanlines({ opacity = 0.5 }: { opacity?: number }) {
  const [h, setH] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setH(e.nativeEvent.layout.height);
  const lines: React.ReactNode[] = [];
  for (let y = 0; y < h; y += 3) {
    lines.push(<View key={y} style={[styles.scanline, { top: y }]} />);
  }
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]} onLayout={onLayout}>
      {lines}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Background — void field + vignette + top hairline                  */
/* ------------------------------------------------------------------ */
export function Background({ scanlines = true }: { scanlines?: boolean }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: color.void }]} />
      {/* vignette approximation: darkened lower band */}
      <View style={styles.vignette} />
      {scanlines && <Scanlines />}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* FadeIn — entrance per --ease-os                                     */
/* ------------------------------------------------------------------ */
export function FadeIn({
  children,
  delay = 0,
  y = 8,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: motion.durSlow,
      delay,
      easing: motion.easeOs,
      useNativeDriver: true,
    }).start();
  }, [delay, v]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [y, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderColor: color.edge,
    backgroundColor: color.surface,
    borderRadius: 0,
  },
  sectionLabel: {
    color: color.textMute,
    fontFamily: font.pixel.medium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  vignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    backgroundColor: 'rgba(4,5,10,0.55)',
  },
});
