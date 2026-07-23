/**
 * 상단바 (height 52). 홈이면 좌측 DOH 워드마크, 그 외엔 뒤로가기(‹) + 가운데 제목.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamily, tracking, weight } from '../theme/tokens';
import { BRAND } from '../brand/brand';

export function TopBar({
  title,
  showBack,
  showBrand,
  onBack,
}: {
  title?: string;
  showBack?: boolean;
  showBrand?: boolean;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        {/* 가운데 제목 (절대배치로 항상 화면 중앙) */}
        {!showBrand && title ? (
          <View pointerEvents="none" style={styles.centerAbs}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        ) : null}

        {/* 좌측: 브랜드 또는 뒤로가기 */}
        {showBrand ? (
          <Text style={styles.brand}>{BRAND.wordmark}</Text>
        ) : showBack ? (
          <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>
    </View>
  );
}

const BAR_H = 52;

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.screenBg },
  row: {
    height: BAR_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  centerAbs: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: { fontSize: 22, color: colors.ink, marginTop: -3, fontWeight: weight.bold },
  brand: {
    fontFamily: fontFamily.serif,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: tracking.wordmark,
  },
  title: { fontSize: 16, fontWeight: weight.semibold, color: colors.ink, letterSpacing: 0.2 },
});
