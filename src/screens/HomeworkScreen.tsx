import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, Press, SectionLabel, t as tt } from '../components/ui';
import { ProFeedback, ProFeedbackCard } from '../components/ProFeedbackCard';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';

// 프로가 이번 주 목표를 내주며 남긴 피드백 (회원 등급에 따라 형식이 달라짐).
// 실제로는 회원 플랜에 맞춰 백엔드에서 형식·내용을 내려준다.
// 데모: Coaching 등급 → 선 그리기 + 음성 설명 영상.
const FEEDBACK: ProFeedback = {
  type: 'annotated',
  tier: 'Coaching',
  pro: '이도형',
  date: '7/20',
  body:
    '다운스윙에서 상체가 먼저 열려요. 영상에 선을 그려뒀으니, 골반이 먼저 도는 타이밍을 눈으로 확인하면서 따라 해보세요.',
  duration: '0:48',
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

      {/* ── 프로 피드백 (페이지의 핵심 · 등급별 형식) ── */}
      <ProFeedbackCard feedback={FEEDBACK} onPlay={() => showToast('피드백 영상 재생은 준비 중이에요')} />

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
