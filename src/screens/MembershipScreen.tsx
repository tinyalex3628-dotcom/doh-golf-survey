import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, PrimaryButton, SectionLabel, t as tt } from '../components/ui';
import { PlanCards } from '../components/PlanCards';
import { colors, radius, weight } from '../theme/tokens';
import { FEEDBACK_FORMATS } from '../data/plans';
import { useNav } from '../navigation/useNav';

export default function MembershipScreen() {
  const { navigation } = useNav();
  return (
    <Screen>
      <Text style={[tt.screenTitle, { fontSize: 20 }]}>어디까지 관리받을까요?</Text>
      <Text style={tt.subtitle}>이도형 프로가 계속 내 골프를 관리해주는 플랜.</Text>
      <PlanCards />

      {/* 플랜별 피드백 형식 (등급 차등) */}
      <SectionLabel style={{ marginTop: 22, marginBottom: 10 }}>플랜별 피드백 방식</SectionLabel>
      <Card style={{ overflow: 'hidden' }}>
        {FEEDBACK_FORMATS.map((f, i) => (
          <View key={f.plan} style={[styles.row, i > 0 && styles.divider]}>
            <View style={styles.emojiTile}>
              <Text style={{ fontSize: 20 }}>{f.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{f.title}</Text>
                <View style={styles.planTag}>
                  <Text style={styles.planTagText}>{f.plan}</Text>
                </View>
              </View>
              <Text style={styles.desc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </Card>
      <Text style={styles.note}>상위 플랜일수록 더 자세하고 개인화된 피드백을 받아요.</Text>

      <PrimaryButton label="홈으로 돌아가기" onPress={() => navigation.navigate('home')} style={{ marginTop: 18 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  emojiTile: {
    width: 42,
    height: 42,
    borderRadius: radius.iconTile,
    backgroundColor: 'rgba(46,92,68,.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 14, fontWeight: weight.black, color: colors.ink },
  planTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: 'rgba(176,122,46,.14)' },
  planTagText: { fontSize: 9.5, fontWeight: weight.black, color: colors.gold },
  desc: { fontSize: 11.5, color: colors.textSecondary, marginTop: 3, lineHeight: 16 },
  note: { fontSize: 11.5, color: colors.textSecondary, marginTop: 10, paddingHorizontal: 2 },
});
