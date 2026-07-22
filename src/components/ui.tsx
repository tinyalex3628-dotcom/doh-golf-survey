/**
 * 공용 UI 프리미티브. 프로토타입에서 반복되는 카드/칩/버튼/진행바 등을 컴포넌트화.
 */
import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, font, radius, shadow, weight } from '../theme/tokens';

/** 눌림 효과가 있는 기본 터치 영역 (프로토타입의 style-active: scale) */
export function Press({
  style,
  activeScale = 0.98,
  children,
  ...rest
}: PressableProps & { activeScale?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [style, pressed && { transform: [{ scale: activeScale }], opacity: 0.96 }]}
    >
      {children as any}
    </Pressable>
  );
}

/** 흰 카드 표면 */
export function Card({
  style,
  emphasis,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  emphasis?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        emphasis ? shadow.emphasis : shadow.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** 다크 그라디언트 카드 (강조) */
export function DarkCard({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  return (
    <LinearGradient
      colors={[colors.deepGreen, colors.ink]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[{ borderRadius: radius.cardLg, overflow: 'hidden' }, shadow.emphasis, style]}
    >
      {children}
    </LinearGradient>
  );
}

/** 섹션 라벨 (작은 대문자 느낌의 강조 텍스트) */
export function SectionLabel({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text
      style={[
        { fontSize: font.sectionLabel, fontWeight: weight.black, color: colors.textFaint, letterSpacing: 0.5 },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** pill 형태 칩 */
export function Pill({
  children,
  color = colors.gold,
  bg = 'rgba(176,122,46,.14)',
  style,
}: {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: bg }, style]}>
      <Text style={{ color, fontSize: 10.5, fontWeight: weight.black }}>{children}</Text>
    </View>
  );
}

/** 진행바 */
export function ProgressBar({ value, height = 7 }: { value: number; height?: number }) {
  return (
    <View style={{ height, borderRadius: radius.pill, backgroundColor: colors.disabledBg, overflow: 'hidden' }}>
      <LinearGradient
        colors={[colors.accentGreen, colors.ink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', borderRadius: radius.pill }}
      />
    </View>
  );
}

/** 진한 CTA 버튼 (게이팅 지원: enabled=false 이면 회색 비활성) */
export function PrimaryButton({
  label,
  onPress,
  enabled = true,
  style,
}: {
  label: string;
  onPress?: () => void;
  enabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Press
      onPress={enabled ? onPress : undefined}
      activeScale={enabled ? 0.99 : 1}
      style={[
        {
          paddingVertical: 15,
          paddingHorizontal: 16,
          borderRadius: radius.button,
          alignItems: 'center',
          backgroundColor: enabled ? colors.ink : colors.disabledBg,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 14, fontWeight: weight.black, color: enabled ? colors.onDark : colors.textDisabled }}>
        {label}
      </Text>
    </Press>
  );
}

/** 밝은/보더 버튼 */
export function GhostButton({
  label,
  onPress,
  style,
  color = colors.ink,
}: {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  color?: string;
}) {
  return (
    <Press
      onPress={onPress}
      activeScale={0.99}
      style={[
        {
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: radius.chip,
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 13, fontWeight: weight.black, color }}>{label}</Text>
    </Press>
  );
}

/** 정사각 아이콘 타일 (이모지) */
export function IconTile({
  emoji,
  size = 40,
  bg = 'rgba(46,92,68,.1)',
  fontSize = 19,
}: {
  emoji: string;
  size?: number;
  bg?: string;
  fontSize?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.iconTile,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize }}>{emoji}</Text>
    </View>
  );
}

export const t = StyleSheet.create({
  screenTitle: {
    fontSize: font.screenTitle,
    fontWeight: weight.black,
    letterSpacing: -0.4,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: font.bodySm,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  cardTitle: {
    fontSize: font.cardTitle,
    fontWeight: weight.black,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: font.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  chevron: {
    fontSize: 17,
    color: colors.textDisabled,
  },
});
