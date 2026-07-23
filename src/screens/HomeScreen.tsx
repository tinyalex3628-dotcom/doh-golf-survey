import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, DarkCard, Press } from '../components/ui';
import { HomeworkProgress } from '../components/HomeworkProgress';
import { colors, fontFamily, radius, tracking, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { RouteName } from '../navigation/pages';
import { BRAND } from '../brand/brand';

const DAY = 86_400_000;

export default function HomeScreen() {
  const { go } = useNav();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const assignedAt = todayStart.getTime() - 3 * DAY;
  const dueAt = todayStart.getTime() + 4 * DAY;

  const stats: { value: string; label: string }[] = [
    { value: '6일', label: '이번 주 연습' },
    { value: '12', label: '등록 스윙' },
    { value: '43%', label: '목표 진행률' },
  ];

  const rooms: { title: string; desc: string; route: RouteName; primary?: boolean }[] = [
    { title: '스윙 분석실', desc: '내 스윙을 프레임·각도로 살펴보기', route: 'hub1', primary: true },
    { title: '프로와 비교', desc: '코치의 스윙과 나란히', route: 'hub2' },
    { title: '골프 사전', desc: '용어·드릴 아카이브', route: 'dict' },
  ];

  return (
    <Screen>
      {/* 1 · 회원 인사 */}
      <View style={styles.greeting}>
        <Text style={styles.eyebrow}>{BRAND.tagline}</Text>
        <Text style={styles.hello}>
          좋은 아침이에요,{'\n'}골프러버 회원님
        </Text>
        <Text style={styles.helloSub}>
          {BRAND.coachName} {BRAND.coachTitle}가 이번 주도 함께합니다 · 연속 6일째
        </Text>
      </View>

      {/* 2 · 오늘의 포커스 (히어로) */}
      <Press onPress={() => go('homework')} activeScale={0.99} style={{ marginTop: 20 }}>
        <DarkCard style={styles.focus}>
          <Text style={styles.focusLabel}>오늘의 포커스</Text>
          <Text style={styles.focusTitle}>임팩트에서 골반 먼저 리드하기</Text>

          <View style={{ marginTop: 18 }}>
            <HomeworkProgress assignedAt={assignedAt} dueAt={dueAt} onDark />
          </View>

          <View style={styles.coachLine}>
            <View style={styles.coachAvatar}>
              <Text style={styles.coachInitial}>{BRAND.coachName.slice(0, 1)}</Text>
            </View>
            <Text style={styles.coachQuote}>
              "‘골반 먼저’ 감각 하나에 집중해요." — {BRAND.coachName} 코치
            </Text>
          </View>

          <View style={styles.focusCtaRow}>
            <Text style={styles.focusCta}>오늘의 코칭 보기</Text>
            <Text style={styles.focusArrow}>→</Text>
          </View>
        </DarkCard>
      </Press>

      {/* 3 · 이번 주 성장 */}
      <Text style={styles.section}>이번 주 성장</Text>
      <View style={styles.statRow}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statTile}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* 4 · 다음 업로드 일정 */}
      <Press onPress={() => go('upload')} activeScale={0.99} style={{ marginTop: 12 }}>
        <Card style={styles.scheduleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.scheduleLabel}>다음 스윙 업로드</Text>
            <Text style={styles.scheduleSub}>코치가 목요일에 확인해요</Text>
          </View>
          <View style={styles.scheduleRight}>
            <Text style={styles.scheduleDate}>7/24</Text>
            <View style={styles.dChip}>
              <Text style={styles.dChipText}>D-2</Text>
            </View>
          </View>
        </Card>
      </Press>

      {/* 5 · 나의 연습실 (은은한 목록) */}
      <Text style={styles.section}>나의 연습실</Text>
      <Card style={{ overflow: 'hidden' }}>
        {rooms.map((r, i) => (
          <Press key={r.route} onPress={() => go(r.route)} activeScale={0.99}>
            <View style={[styles.roomRow, i > 0 && styles.roomDivider]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.roomTitle}>{r.title}</Text>
                <Text style={styles.roomDesc}>{r.desc}</Text>
              </View>
              <Text style={[styles.roomChevron, r.primary && { color: colors.gold }]}>→</Text>
            </View>
          </Press>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // 인사
  greeting: { paddingTop: 8 },
  eyebrow: {
    fontFamily: fontFamily.serif,
    fontSize: 11,
    letterSpacing: tracking.label,
    color: colors.gold,
  },
  hello: { fontSize: 24, fontWeight: weight.bold, color: colors.ink, lineHeight: 32, marginTop: 10, letterSpacing: -0.3 },
  helloSub: { fontSize: 12.5, color: colors.textSecondary, marginTop: 8, lineHeight: 18 },

  // 오늘의 포커스
  focus: { padding: 22 },
  focusLabel: {
    fontFamily: fontFamily.serif,
    fontSize: 11,
    letterSpacing: tracking.label,
    color: colors.goldLight,
  },
  focusTitle: { fontSize: 19, fontWeight: weight.bold, color: colors.onDark, marginTop: 10, lineHeight: 26, letterSpacing: -0.2 },
  coachLine: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  coachAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(227,210,166,.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachInitial: { fontSize: 12, color: colors.goldLight, fontWeight: weight.semibold },
  coachQuote: { flex: 1, fontSize: 12.5, color: colors.onDarkSecondary, lineHeight: 18 },
  focusCtaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  focusCta: { fontSize: 13, fontWeight: weight.bold, color: colors.goldLight, letterSpacing: 0.2 },
  focusArrow: { fontSize: 15, color: colors.goldLight },

  // 섹션 라벨
  section: {
    fontSize: 12,
    fontWeight: weight.semibold,
    color: colors.textFaint,
    letterSpacing: 0.6,
    marginTop: 28,
    marginBottom: 12,
  },

  // 성장 통계
  statRow: { flexDirection: 'row', gap: 10 },
  statTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: { fontFamily: fontFamily.serif, fontSize: 24, color: colors.ink },
  statLabel: { fontSize: 10.5, color: colors.textWeak, marginTop: 6, letterSpacing: 0.2 },

  // 업로드 일정
  scheduleRow: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  scheduleLabel: { fontSize: 14, fontWeight: weight.bold, color: colors.ink },
  scheduleSub: { fontSize: 11.5, color: colors.textWeak, marginTop: 3 },
  scheduleRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scheduleDate: { fontFamily: fontFamily.serif, fontSize: 18, color: colors.ink },
  dChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(176,142,82,.14)' },
  dChipText: { fontSize: 11, fontWeight: weight.bold, color: colors.gold },

  // 연습실 목록
  roomRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 17, paddingHorizontal: 18 },
  roomDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  roomTitle: { fontSize: 14.5, fontWeight: weight.bold, color: colors.ink, letterSpacing: -0.1 },
  roomDesc: { fontSize: 11.5, color: colors.textWeak, marginTop: 3 },
  roomChevron: { fontSize: 16, color: colors.textDisabled },
});
