import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, DarkCard, Press } from '../components/ui';
import { ClubCrest } from '../components/ClubCrest';
import { CourseBackdrop } from '../components/CourseBackdrop';
import { FairwayProgress } from '../components/FairwayProgress';
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
    { value: '6', label: '연습일' },
    { value: '12', label: '등록 스윙' },
    { value: '43%', label: '진행률' },
  ];

  const rooms: { title: string; desc: string; route: RouteName; primary?: boolean }[] = [
    { title: '스윙 분석실', desc: '내 스윙을 프레임·각도로', route: 'hub1', primary: true },
    { title: '프로와 비교', desc: '코치의 스윙과 나란히', route: 'hub2' },
    { title: '골프 사전', desc: '용어·드릴 아카이브', route: 'dict' },
  ];

  return (
    <Screen>
      <CourseBackdrop />

      {/* 브랜드 시그니처 크레스트 + 인사 */}
      <View style={styles.header}>
        <ClubCrest memberNo="NO. 0426" />
        <Text style={styles.hello}>골프러버 회원님, 좋은 아침이에요</Text>
        <Text style={styles.helloSub}>
          {BRAND.coachName} {BRAND.coachTitle} · 연속 6일째
        </Text>
      </View>

      {/* TODAY'S ROUND — 히어로 */}
      <Press onPress={() => go('homework')} activeScale={0.99} style={{ marginTop: 22 }}>
        <DarkCard style={styles.round}>
          <View style={styles.roundHead}>
            <Text style={styles.roundEyebrow}>TODAY’S ROUND</Text>
            <Text style={styles.roundKo}>오늘의 미션</Text>
          </View>
          <Text style={styles.roundTitle}>임팩트에서{'\n'}골반 먼저 리드하기</Text>

          <View style={{ marginTop: 18 }}>
            <FairwayProgress assignedAt={assignedAt} dueAt={dueAt} />
          </View>

          <View style={styles.coachLine}>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
            <Text style={styles.coachQuote}>
              “‘골반 먼저’ 감각 하나에 집중해요.” — {BRAND.coachName} 코치
            </Text>
          </View>

          <View style={styles.ctaBtn}>
            <Text style={styles.ctaText}>오늘의 코칭 보기</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </View>
        </DarkCard>
      </Press>

      {/* 이번 주 성장 — 단순한 한 줄 통계 */}
      <Text style={styles.section}>이번 주 성장</Text>
      <Card style={styles.statCard}>
        {stats.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <View style={styles.statDivider} />}
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </Card>

      {/* 다음 업로드 일정 */}
      <Press onPress={() => go('upload')} activeScale={0.99} style={{ marginTop: 10 }}>
        <Card style={styles.scheduleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.scheduleLabel}>다음 스윙 업로드</Text>
            <Text style={styles.scheduleSub}>코치가 목요일에 확인해요</Text>
          </View>
          <Text style={styles.scheduleDate}>7/24</Text>
          <View style={styles.dChip}>
            <Text style={styles.dChipText}>D-2</Text>
          </View>
        </Card>
      </Press>

      {/* 나의 연습실 */}
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
  header: { alignItems: 'center', paddingTop: 14 },
  hello: { fontSize: 15, fontWeight: weight.bold, color: colors.ink, marginTop: 18, letterSpacing: -0.2 },
  helloSub: { fontSize: 11.5, color: colors.textSecondary, marginTop: 5, letterSpacing: 0.2 },

  // TODAY'S ROUND
  round: { padding: 22 },
  roundHead: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  roundEyebrow: { fontFamily: fontFamily.serif, fontSize: 12, letterSpacing: 2.5, color: colors.goldLight },
  roundKo: { fontSize: 11, color: colors.onDarkSecondary, letterSpacing: 0.4 },
  roundTitle: { fontSize: 24, fontWeight: weight.heavy, color: colors.onDark, marginTop: 12, lineHeight: 31, letterSpacing: -0.4 },
  coachLine: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  proBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: colors.gold },
  proBadgeText: { fontSize: 9.5, fontWeight: weight.heavy, color: colors.heroBottom, letterSpacing: 1 },
  coachQuote: { flex: 1, fontSize: 12.5, color: colors.onDarkSecondary, lineHeight: 18, fontWeight: weight.regular },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 13,
    borderRadius: radius.button,
    backgroundColor: colors.gold,
  },
  ctaText: { fontSize: 13.5, fontWeight: weight.bold, color: colors.heroBottom, letterSpacing: 0.3 },
  ctaArrow: { fontSize: 15, color: colors.heroBottom },

  // 섹션 라벨
  section: {
    fontSize: 11.5,
    fontWeight: weight.semibold,
    color: colors.textFaint,
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 11,
    textTransform: 'uppercase',
  },

  // 통계 (한 카드, 3열 + 세로 구분선)
  statCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  statCol: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border, marginVertical: 2 },
  statValue: { fontFamily: fontFamily.serif, fontSize: 26, color: colors.ink },
  statLabel: { fontSize: 10.5, color: colors.textWeak, marginTop: 5, letterSpacing: 0.3 },

  // 업로드 일정
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 18 },
  scheduleLabel: { fontSize: 14, fontWeight: weight.bold, color: colors.ink },
  scheduleSub: { fontSize: 11.5, color: colors.textWeak, marginTop: 3 },
  scheduleDate: { fontFamily: fontFamily.serif, fontSize: 18, color: colors.ink },
  dChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(191,160,92,.16)' },
  dChipText: { fontSize: 11, fontWeight: weight.bold, color: colors.goldDeep },

  // 연습실
  roomRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18 },
  roomDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  roomTitle: { fontSize: 14.5, fontWeight: weight.bold, color: colors.ink, letterSpacing: -0.1 },
  roomDesc: { fontSize: 11.5, color: colors.textWeak, marginTop: 2 },
  roomChevron: { fontSize: 16, color: colors.textDisabled },
});
