import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, IconTile, Press, PrimaryButton, t as tt } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { RouteName } from '../navigation/pages';

const CARDS: { icon: string; name: string; desc: string; route: RouteName }[] = [
  { icon: '🎁', name: '구독별 혜택 안내', desc: 'Basic · Coaching · Elite 혜택 비교', route: 'subBenefits' },
  { icon: '📍', name: '오프라인 레슨 정보', desc: '현장 레슨 위치 · 일정 · 예약', route: 'subOffline' },
  { icon: '👤', name: '이도형 프로는?', desc: '프로 소개 · 유튜브 채널 링크', route: 'subPro' },
  { icon: '🎬', name: '피드백 과정 영상', desc: '구독자 혜택 · 실제 피드백 예시', route: 'subFeedback' },
];

export default function SubscriptionScreen() {
  const { go } = useNav();
  return (
    <Screen>
      <View style={{ paddingHorizontal: 2 }}>
        <Text style={tt.screenTitle}>구독별 안내사항</Text>
        <Text style={tt.subtitle}>숙제를 더 받거나 프로에게 문의하고 싶다면 여기서 시작해요.</Text>
      </View>

      <View style={{ gap: 10, marginTop: 16 }}>
        {CARDS.map((c) => (
          <Press key={c.route} onPress={() => go(c.route)} activeScale={0.99}>
            <Card style={styles.row}>
              <IconTile emoji={c.icon} size={42} bg="rgba(27,38,32,.05)" />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.desc}>{c.desc}</Text>
              </View>
              <Text style={{ color: colors.textDisabled, fontSize: 17 }}>›</Text>
            </Card>
          </Press>
        ))}
      </View>

      <PrimaryButton label="플랜 가입 · 문의하기 ›" onPress={() => go('membership')} style={{ marginTop: 12 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16, borderRadius: radius.card },
  name: { fontSize: 15, fontWeight: weight.black, color: colors.ink },
  desc: { fontSize: 11.5, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
});
