/**
 * 스윙 영상 분석 무대. 다크 배경 + 실루엣 가이드 + (옵션) 각도선.
 * 실제 영상/AI는 준비 중 → 플레이스홀더.
 */
import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { colors, weight } from '../theme/tokens';

export function SwingStage({
  showLine,
  angleText,
  badge,
  style,
  children,
}: {
  showLine?: boolean;
  angleText?: string;
  badge?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  return (
    <View style={[styles.stage, style]}>
      {/* 실루엣 가이드 */}
      <View style={styles.silhouette} />
      {/* 각도선 */}
      <Svg style={StyleSheet.absoluteFill as any} viewBox="0 0 100 133" preserveAspectRatio="none">
        <Line x1={14} y1={115} x2={86} y2={115} stroke="rgba(237,217,163,.4)" strokeWidth={0.4} strokeDasharray="2 2" />
        {showLine ? <Line x1={30} y1={115} x2={70} y2={95} stroke={colors.goldLight} strokeWidth={1} /> : null}
      </Svg>
      {showLine && angleText ? (
        <View style={styles.angleBadge}>
          <Text style={styles.angleText}>{angleText}</Text>
        </View>
      ) : null}
      {badge ? (
        <View style={styles.topBadge}>
          <Text style={styles.topBadgeText}>{badge}</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { borderRadius: 16, overflow: 'hidden', backgroundColor: colors.darkestGreen, aspectRatio: 3 / 4 },
  silhouette: {
    position: 'absolute',
    left: '33%',
    top: '15%',
    width: '34%',
    height: '74%',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    backgroundColor: 'rgba(247,244,236,.1)',
    borderWidth: 1,
    borderColor: 'rgba(247,244,236,.3)',
    borderStyle: 'dashed',
  },
  angleBadge: {
    position: 'absolute',
    top: '50%',
    left: '56%',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    backgroundColor: 'rgba(11,21,16,.85)',
  },
  angleText: { color: colors.goldLight, fontSize: 11, fontWeight: weight.black },
  topBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: 'rgba(11,21,16,.7)',
  },
  topBadgeText: { color: colors.goldLight, fontSize: 10.5, fontWeight: weight.black },
});
