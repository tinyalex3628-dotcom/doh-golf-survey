import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, DarkCard, Press, PrimaryButton, SectionLabel } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { RouteName } from '../navigation/pages';

const CARDS: { num: string; name: string; desc: string; route: RouteName }[] = [
  { num: '1', name: '프로 선택', desc: '남성/여성 프로', route: 'proSelect' },
  { num: '2', name: '카메라 선택', desc: '정면/측면 각도', route: 'camera' },
  { num: '3', name: '프로 단독 분석', desc: 'P1–P10 학습', route: 'proSolo' },
  { num: '4', name: '프로와 내 스윙 비교', desc: '멀티스크린 · 프레임 동기화', route: 'proCompare' },
];

export default function Hub2Screen() {
  const { go } = useNav();
  return (
    <Screen>
      <DarkCard style={{ padding: 18 }}>
        <SectionLabel style={{ color: colors.goldLight, letterSpacing: 1 }}>DOH 핵심 차별화</SectionLabel>
        <Text style={styles.heroTitle}>프로 스윙을 배우고{'\n'}내 스윙과 비교해요</Text>
        <Text style={styles.heroDesc}>
          프로 선택 → 카메라 → 프로 단독 분석 → 내 스윙과 비교. P1–P10 버튼으로 자세를 학습해요.
        </Text>
      </DarkCard>

      <SectionLabel style={{ marginTop: 18, marginBottom: 9 }}>이 Hub의 페이지</SectionLabel>
      <View style={{ gap: 9 }}>
        {CARDS.map((c) => (
          <Press key={c.route} onPress={() => go(c.route)} activeScale={0.99}>
            <Card style={styles.row}>
              <View style={styles.num}>
                <Text style={styles.numText}>{c.num}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.desc}>{c.desc}</Text>
              </View>
              <Text style={{ color: colors.textDisabled, fontSize: 17 }}>›</Text>
            </Card>
          </Press>
        ))}
      </View>

      <PrimaryButton label="시작하기 — 프로 선택부터 ›" onPress={() => go('proSelect')} style={{ marginTop: 14 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroTitle: { fontSize: 21, fontWeight: weight.black, color: colors.onDark, marginTop: 6, letterSpacing: -0.4, lineHeight: 27 },
  heroDesc: { fontSize: 12, color: colors.onDarkSecondary, marginTop: 6, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 15 },
  num: { width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(46,92,68,.1)', alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: 13, fontWeight: weight.black, color: colors.accentGreen },
  name: { fontSize: 14.5, fontWeight: weight.black, color: colors.ink },
  desc: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
});
