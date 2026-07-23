/**
 * 숙제 "기간" 진행바.
 * 숙제 낸 날(assignedAt) = 0%, 마감/피드백 날(dueAt) = 100%.
 * 날짜가 지날수록 채워지고, 골퍼 🏌️가 깃발 ⛳(목표)을 향해 오른쪽으로 이동한다.
 * 화면에 들어올 때마다 0 → 오늘 위치까지 슬라이드되어 "오늘은 여기까지 왔다"를 보여준다.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, weight } from '../theme/tokens';

const DAY = 86_400_000;
const md = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export function HomeworkProgress({
  assignedAt,
  dueAt,
  onDark = false,
}: {
  assignedAt: number;
  dueAt: number;
  onDark?: boolean;
}) {
  const [w, setW] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;

  const now = Date.now();
  const total = Math.max(1, dueAt - assignedAt);
  const rawPct = (now - assignedAt) / total;
  const pct = Math.max(0, Math.min(1, rawPct));
  const done = rawPct >= 1;
  const dayN = Math.max(1, Math.floor((now - assignedAt) / DAY) + 1);
  const daysLeft = Math.max(0, Math.ceil((dueAt - now) / DAY));

  useEffect(() => {
    if (w > 0) {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: pct,
        duration: 950,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [w, pct]);

  const fillW = anim.interpolate({ inputRange: [0, 1], outputRange: [0, w] });
  const trackBg = onDark ? 'rgba(247,244,236,.16)' : colors.disabledBg;
  const weak = onDark ? colors.onDarkSecondary : colors.textWeak;
  const strong = onDark ? colors.goldLight : colors.accentGreen;

  return (
    <View>
      {/* 이모지 레인 (골퍼가 오른쪽으로 이동, 오른쪽 끝에 깃발) */}
      <View style={styles.lane} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        <Animated.Text style={[styles.golfer, { transform: [{ translateX: Animated.subtract(fillW, 11) }] }]}>
          {done ? '🎉' : '🏌️'}
        </Animated.Text>
        <Text style={styles.flag}>⛳</Text>
      </View>

      {/* 트랙 + 채워지는 바 */}
      <View style={[styles.track, { backgroundColor: trackBg }]}>
        <Animated.View style={{ width: fillW, height: '100%' }}>
          <LinearGradient
            colors={onDark ? [colors.goldLight, '#C9A85C'] : [colors.accentGreen, colors.ink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, borderRadius: radius.pill }}
          />
        </Animated.View>
      </View>

      {/* 라벨: 시작 · 진행(오늘) · 마감 */}
      <View style={styles.labels}>
        <Text style={[styles.labelWeak, { color: weak }]}>시작 {md(assignedAt)}</Text>
        <Text style={[styles.labelStrong, { color: strong }]}>
          {done ? '완료까지 도착! 🎯' : `${dayN}일째 · D-${daysLeft}`}
        </Text>
        <Text style={[styles.labelWeak, { color: weak }]}>마감 {md(dueAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lane: { height: 22, justifyContent: 'center' },
  golfer: { position: 'absolute', left: 0, fontSize: 17 },
  flag: { position: 'absolute', right: -2, fontSize: 16 },
  track: { height: 8, borderRadius: radius.pill, overflow: 'hidden', marginTop: 2 },
  labels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 },
  labelWeak: { fontSize: 10.5, fontWeight: weight.bold },
  labelStrong: { fontSize: 11, fontWeight: weight.black },
});
