import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, DarkCard, Press, SectionLabel, t as tt } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';

// 프로가 이번 주 목표를 내주며 남긴 피드백/레슨 (실제로는 백엔드에서 로드)
const FEEDBACK = {
  pro: '이도형',
  date: '7/20',
  body:
    '지난 스윙을 보니 다운스윙에서 상체가 먼저 열리면서 골반 회전이 늦어요. 그래서 임팩트에서 손이 뒤처지고 방향이 흔들립니다. 이번 주는 딱 하나, "골반이 먼저 돈다"는 감각만 잡아봅시다.',
  points: [
    '다운스윙 시작은 어깨가 아니라 골반부터',
    '백스윙 탑에서 0.5초 멈추고 위치 고정',
    '천천히 10번, 감각 위주로 반복 촬영',
  ],
};

const HW_ITEMS = [
  {
    title: '임팩트에서 골반 먼저 리드하기',
    due: '~7/27',
    prog: 60,
    desc: '다운스윙에서 골반이 어깨보다 먼저 열리도록 10회 반복 촬영',
  },
  { title: '백스윙 탑 위치 고정', due: '~7/27', prog: 20, desc: '탑에서 0.5초 멈추는 드릴 · 정면에서 촬영해 확인' },
];

export default function HomeworkScreen() {
  const { go } = useNav();
  const { showToast } = useToast();

  return (
    <Screen>
      <View style={{ paddingHorizontal: 2 }}>
        <Text style={tt.screenTitle}>이번 주 목표 숙제</Text>
        <Text style={tt.subtitle}>이도형 프로가 남긴 레슨을 보고 이번 주를 연습해요.</Text>
      </View>

      {/* ── 프로 피드백 (페이지의 핵심 · 가장 크게) ── */}
      <DarkCard style={styles.feedback}>
        <View style={styles.fbHead}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>PRO</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fbPro}>{FEEDBACK.pro} 프로 피드백</Text>
            <Text style={styles.fbDate}>{FEEDBACK.date} · 이번 주 레슨</Text>
          </View>
        </View>

        <Text style={styles.fbBody}>{FEEDBACK.body}</Text>

        <View style={styles.points}>
          {FEEDBACK.points.map((p, i) => (
            <View key={i} style={styles.pointRow}>
              <Text style={styles.pointNum}>{i + 1}</Text>
              <Text style={styles.pointText}>{p}</Text>
            </View>
          ))}
        </View>

        {/* 프로 레슨 영상 (준비 중 플레이스홀더) */}
        <Press activeScale={0.98} onPress={() => showToast('프로 레슨 영상은 준비 중이에요')} style={styles.lessonRow}>
          <View style={styles.playDot}>
            <Text style={{ fontSize: 13, color: colors.ink }}>▶</Text>
          </View>
          <Text style={styles.lessonText}>프로 레슨 영상 보기</Text>
          <Text style={styles.lessonSoon}>준비 중</Text>
        </Press>
      </DarkCard>

      <Text style={styles.recheck}>헷갈릴 땐 언제든 이 피드백을 다시 확인하세요.</Text>

      {/* ── 이번 주 숙제 ── */}
      <SectionLabel style={{ marginTop: 20 }}>이번 주 숙제</SectionLabel>
      <View style={{ gap: 11, marginTop: 10 }}>
        {HW_ITEMS.map((h) => (
          <Card key={h.title} style={{ padding: 16 }}>
            <View style={styles.itemHead}>
              <Text style={styles.itemTitle}>{h.title}</Text>
              <Text style={styles.itemDue}>{h.due}</Text>
            </View>
            <Text style={styles.itemDesc}>{h.desc}</Text>
            <View style={styles.miniTrack}>
              <View style={[styles.miniFill, { width: `${h.prog}%` }]} />
            </View>
          </Card>
        ))}
      </View>

      {/* ── 액션 ── */}
      <SectionLabel style={{ marginTop: 18 }}>숙제, 어떻게 할까요?</SectionLabel>
      <Press onPress={() => go('upload')} activeScale={0.99} style={[styles.actionRow, styles.actionDark]}>
        <Text style={styles.actionDarkText}>숙제 다 했어요 — 스윙 업로드</Text>
        <Text style={{ color: colors.onDark }}>›</Text>
      </Press>
      <Press onPress={() => go('feedback')} activeScale={0.99} style={[styles.actionRow, styles.actionGold]}>
        <Text style={styles.actionGoldText}>잘 모르겠어요 — 프로에게 문의</Text>
        <Text style={{ color: colors.gold }}>›</Text>
      </Press>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // 피드백 히어로
  feedback: { marginTop: 16, padding: 20 },
  fbHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(237,217,163,.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 9, fontWeight: weight.black, color: colors.goldLight },
  fbPro: { fontSize: 15, fontWeight: weight.black, color: colors.onDark },
  fbDate: { fontSize: 11, color: colors.onDarkSecondary, marginTop: 2 },
  fbBody: { fontSize: 15.5, lineHeight: 25, color: colors.onDark, marginTop: 16, fontWeight: weight.bold },
  points: { marginTop: 16, gap: 9 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  pointNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 11,
    fontWeight: weight.black,
    color: colors.darkestGreen,
    backgroundColor: colors.goldLight,
    overflow: 'hidden',
  },
  pointText: { flex: 1, fontSize: 13, lineHeight: 19, color: 'rgba(247,244,236,.9)', fontWeight: weight.semibold },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: radius.chip,
    backgroundColor: 'rgba(247,244,236,.1)',
  },
  playDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonText: { flex: 1, fontSize: 13, fontWeight: weight.black, color: colors.onDark },
  lessonSoon: { fontSize: 10.5, fontWeight: weight.black, color: colors.onDarkSecondary },
  recheck: { fontSize: 11.5, color: colors.textSecondary, marginTop: 10, paddingHorizontal: 2 },

  // 숙제 항목
  itemHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  itemTitle: { fontSize: 15, fontWeight: weight.black, color: colors.ink, flex: 1, lineHeight: 20 },
  itemDue: { marginLeft: 10, fontSize: 11, fontWeight: weight.black, color: colors.gold },
  itemDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 5, lineHeight: 18 },
  miniTrack: { height: 6, borderRadius: radius.pill, backgroundColor: colors.disabledBg, overflow: 'hidden', marginTop: 11 },
  miniFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accentGreen },

  // 액션
  actionRow: {
    marginTop: 9,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionDark: { backgroundColor: colors.ink },
  actionDarkText: { fontSize: 13.5, fontWeight: weight.black, color: colors.onDark },
  actionGold: { backgroundColor: 'rgba(176,122,46,.09)', borderWidth: 1, borderColor: 'rgba(176,122,46,.4)', borderStyle: 'dashed' },
  actionGoldText: { fontSize: 12.5, fontWeight: weight.black, color: colors.ink },
});
