/**
 * 클럽 크레스트 — 브랜드 시그니처.
 * serif 워드마크를 골드 룰(선) 사이에 두고, 작은 깃발 마크 + 회원번호로
 * "프라이빗 골프 클럽 · 회원 전용" 느낌을 만든다. (이 앱만의 강한 요소)
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { colors, fontFamily, tracking } from '../theme/tokens';
import { BRAND } from '../brand/brand';

export function ClubCrest({ memberNo = 'NO. 0426' }: { memberNo?: string }) {
  return (
    <View style={styles.wrap}>
      {/* 작은 깃발 마크 (골드) */}
      <Svg width={16} height={18} viewBox="0 0 16 18" style={{ marginBottom: 6 }}>
        <Line x1={4} y1={2} x2={4} y2={16} stroke={colors.gold} strokeWidth={1.4} strokeLinecap="round" />
        <Path d="M4 2 L13 4.6 L4 7.2 Z" fill={colors.gold} />
      </Svg>

      <Text style={styles.wordmark}>{BRAND.wordmark}</Text>

      <View style={styles.ruleRow}>
        <View style={styles.rule} />
        <Text style={styles.sub}>GOLF CLUB</Text>
        <View style={styles.rule} />
      </View>

      <Text style={styles.member}>MEMBER · {memberNo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  wordmark: {
    fontFamily: fontFamily.serif,
    fontSize: 30,
    color: colors.ink,
    letterSpacing: tracking.wordmark + 1,
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  rule: { width: 28, height: 1, backgroundColor: colors.gold, opacity: 0.85 },
  sub: {
    fontFamily: fontFamily.serif,
    fontSize: 10,
    letterSpacing: 3,
    color: colors.textSecondary,
  },
  member: { fontSize: 9.5, letterSpacing: 1.5, color: colors.gold, marginTop: 8, fontWeight: '600' },
});
