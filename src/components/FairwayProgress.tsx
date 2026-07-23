/**
 * 페어웨이형 진행바 — 골프 문화 주입.
 * 배정일=티(0%), 마감/피드백일=그린의 핀(100%). 공이 페어웨이를 따라 핀으로 전진.
 * 골드는 핀(깃발)과 진행 라벨에 집중 사용.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';
import { colors, fontFamily, weight } from '../theme/tokens';

const DAY = 86_400_000;
const md = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export function FairwayProgress({ assignedAt, dueAt }: { assignedAt: number; dueAt: number }) {
  const [w, setW] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;

  const now = Date.now();
  const total = Math.max(1, dueAt - assignedAt);
  const pct = Math.max(0, Math.min(1, (now - assignedAt) / total));
  const done = now >= dueAt;
  const dayN = Math.max(1, Math.floor((now - assignedAt) / DAY) + 1);
  const daysLeft = Math.max(0, Math.ceil((dueAt - now) / DAY));

  useEffect(() => {
    if (w > 0) {
      anim.setValue(0);
      Animated.timing(anim, { toValue: pct, duration: 1000, delay: 250, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    }
  }, [w, pct]);

  // 공이 이동할 수 있는 폭 (핀 여유 확보)
  const travel = Math.max(0, w - 26);
  const ballX = anim.interpolate({ inputRange: [0, 1], outputRange: [10, 10 + travel] });

  return (
    <View>
      <View style={styles.lane} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {/* 페어웨이(모잉 스트라이프) */}
        <Svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
          {Array.from({ length: 10 }).map((_, i) => (
            <Rect key={i} x={i * 10} y={0} width={10} height={40} fill={i % 2 === 0 ? '#2E6A4F' : '#357A5A'} />
          ))}
        </Svg>

        {/* 그린(핀 주변) + 핀·깃발 (골드) */}
        <View style={styles.green}>
          <Svg width={22} height={40} viewBox="0 0 22 40">
            <Line x1={6} y1={6} x2={6} y2={34} stroke={colors.goldLight} strokeWidth={1.6} strokeLinecap="round" />
            <Path d="M6 6 L17 9.5 L6 13 Z" fill={colors.gold} />
          </Svg>
        </View>

        {/* 공 */}
        <Animated.View style={[styles.ball, { transform: [{ translateX: ballX }] }]} />
      </View>

      <View style={styles.labels}>
        <Text style={styles.side}>티 · {md(assignedAt)}</Text>
        <Text style={styles.center}>{done ? '홀 아웃! 🏁' : `${dayN}일째 · D-${daysLeft}`}</Text>
        <Text style={styles.side}>핀 · {md(dueAt)}</Text>
      </View>
    </View>
  );
}

const LANE_H = 40;

const styles = StyleSheet.create({
  lane: { height: LANE_H, borderRadius: 10, overflow: 'hidden', backgroundColor: '#2E6A4F' },
  green: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3F855F' },
  ball: {
    position: 'absolute',
    left: 0,
    top: LANE_H / 2 - 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15,46,36,.25)',
  },
  labels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 },
  side: { fontSize: 10.5, fontWeight: weight.medium, color: colors.onDarkSecondary },
  center: { fontFamily: fontFamily.serif, fontSize: 12.5, color: colors.goldLight },
});
