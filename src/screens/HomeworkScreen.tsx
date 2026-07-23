import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, Press, SectionLabel, t as tt } from '../components/ui';
import { ProFeedback, ProFeedbackCard } from '../components/ProFeedbackCard';
import { UpsellCard } from '../components/UpsellCard';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';
import { Tier, useSubscription } from '../state/subscription';

// 회원 등급별 피드백 (형식이 달라짐) — 실제로는 백엔드에서 회원 플랜에 맞춰 내려줌
const FEEDBACK_BY_TIER: Record<Tier, ProFeedback> = {
  Basic: {
    type: 'photo',
    tier: 'Basic',
    pro: '이도형',
    date: '7/20',
    body: '스윙 사진을 보니 임팩트에서 손이 뒤처져요. 표시해둔 부분처럼 골반을 먼저 돌려 손이 몸 앞에 오도록 해보세요.',
    photos: 2,
  },
  Coaching: {
    type: 'annotated',
    tier: 'Coaching',
    pro: '이도형',
    date: '7/20',
    body: '다운스윙에서 상체가 먼저 열려요. 영상에 선을 그려뒀으니, 골반이 먼저 도는 타이밍을 눈으로 확인하면서 따라 해보세요.',
    duration: '0:48',
  },
  Elite: {
    type: 'custom',
    tier: 'Elite',
    pro: '이도형',
    date: '7/20',
    title: '회원님 맞춤 레슨 · 골반 리드',
    body: '회원님 스윙에 맞춰 2분 30초 영상으로 순서대로 설명했어요. 따라 하면서 감각을 잡아보세요.',
    duration: '2:30',
  },
};

const HW_ITEMS = [
  { title: '임팩트에서 골반 먼저 리드하기', due: '~7/27', prog: 60, desc: '다운스윙에서 골반이 어깨보다 먼저 열리도록 10회 반복 촬영' },
  { title: '백스윙 탑 위치 고정', due: '~7/27', prog: 20, desc: '탑에서 0.5초 멈추는 드릴 · 정면에서 촬영해 확인' },
];

export default function HomeworkScreen() {
  const { go } = useNav();
  const { showToast } = useToast();
  const { tier } = useSubscription();
  const feedback = FEEDBACK_BY_TIER[tier];

  return (
    <Screen>
      <View style={{ paddingHorizontal: 2 }}>
        <Text style={tt.screenTitle}>이번 주 목표 숙제</Text>
        <View style={styles.subRow}>
          <Text style={tt.subtitle}>이도형 프로가 남긴 레슨을 보고 이번 주를 연습해요.</Text>
        </View>
        <View style={styles.planChip}>
          <Text style={styles.planChipText}>{tier} 플랜</Text>
        </View>
      </View>

      {/* 프로 피드백 (등급별 형식) */}
      <ProFeedbackCard feedback={feedback} onPlay={() => showToast('피드백 영상 재생은 준비 중이에요')} />
      <Text style={styles.recheck}>헷갈릴 땐 언제든 이 피드백을 다시 확인하세요.</Text>

      {/* 이번 주 숙제 */}
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

      {/* ── 등급별 추가 영역 ── */}
      {tier === 'Basic' && (
        <View style={{ marginTop: 16 }}>
          <UpsellCard
            eyebrow="＋ 영상 피드백"
            title="선 그리기 + 음성으로 더 자세히"
            body="내 스윙 영상 위에 프로가 직접 선을 그리고 말로 짚어주는 피드백을 받아보세요."
            cta="피드백 플랜 알아보기 ›"
            onPress={() => go('subscription')}
          />
        </View>
      )}

      {tier === 'Coaching' && (
        <>
          {/* 관리 플랜의 '지속 관리' 느낌 */}
          <SectionLabel style={{ marginTop: 20 }}>2주 목표 관리</SectionLabel>
          <Press onPress={() => showToast('지난 피드백 모아보기는 준비 중이에요')} activeScale={0.99} style={{ marginTop: 10 }}>
            <Card style={styles.manageRow}>
              <View style={styles.manageIcon}>
                <Text style={{ fontSize: 17 }}>🗂</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.manageTitle}>지난 피드백 모아보기</Text>
                <Text style={styles.manageSub}>지난 2주 피드백 3개 · 다음 점검 7/27</Text>
              </View>
              <Text style={{ color: colors.textDisabled, fontSize: 17 }}>›</Text>
            </Card>
          </Press>
          {/* Elite로의 은근한 안내 */}
          <Press onPress={() => go('subscription')} activeScale={0.99} style={styles.eliteHint}>
            <Text style={styles.eliteHintText}>🎬 회원 맞춤 2~3분 영상 피드백은 Elite에서</Text>
            <Text style={styles.eliteHintCta}>보기 ›</Text>
          </Press>
        </>
      )}

      {tier === 'Elite' && (
        <>
          <SectionLabel style={{ marginTop: 20 }}>Elite 전용</SectionLabel>
          <Card style={{ marginTop: 10, overflow: 'hidden' }}>
            <Press onPress={() => go('feedback')} activeScale={0.99} style={styles.eliteRow}>
              <View style={styles.eliteIcon}>
                <Text style={{ fontSize: 16 }}>💬</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eliteTitle}>프로에게 바로 질문</Text>
                <Text style={styles.eliteSub}>횟수 제한 없이 언제든 물어보세요</Text>
              </View>
              <View style={styles.unlimited}>
                <Text style={styles.unlimitedText}>무제한</Text>
              </View>
            </Press>
            <Press onPress={() => showToast('맞춤 영상 예약은 준비 중이에요')} activeScale={0.99} style={[styles.eliteRow, styles.eliteDivider]}>
              <View style={styles.eliteIcon}>
                <Text style={{ fontSize: 16 }}>🎬</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eliteTitle}>다음 맞춤 영상 예약</Text>
                <Text style={styles.eliteSub}>1:1 맞춤 레슨 영상을 예약해요</Text>
              </View>
              <Text style={{ color: colors.textDisabled, fontSize: 17 }}>›</Text>
            </Press>
          </Card>
        </>
      )}

      {/* 액션 */}
      <SectionLabel style={{ marginTop: 20 }}>숙제, 어떻게 할까요?</SectionLabel>
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
  subRow: { marginTop: 0 },
  planChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(46,92,68,.1)',
  },
  planChipText: { fontSize: 10.5, fontWeight: weight.black, color: colors.accentGreen },
  recheck: { fontSize: 11.5, color: colors.textSecondary, marginTop: 10, paddingHorizontal: 2 },

  itemHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  itemTitle: { fontSize: 15, fontWeight: weight.black, color: colors.ink, flex: 1, lineHeight: 20 },
  itemDue: { marginLeft: 10, fontSize: 11, fontWeight: weight.black, color: colors.gold },
  itemDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 5, lineHeight: 18 },
  miniTrack: { height: 6, borderRadius: radius.pill, backgroundColor: colors.disabledBg, overflow: 'hidden', marginTop: 11 },
  miniFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accentGreen },

  // Coaching 관리
  manageRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15 },
  manageIcon: { width: 40, height: 40, borderRadius: radius.iconTile, backgroundColor: 'rgba(46,92,68,.08)', alignItems: 'center', justifyContent: 'center' },
  manageTitle: { fontSize: 14, fontWeight: weight.black, color: colors.ink },
  manageSub: { fontSize: 11, color: colors.textWeak, marginTop: 2 },
  eliteHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    backgroundColor: 'rgba(176,122,46,.06)',
  },
  eliteHintText: { fontSize: 12, fontWeight: weight.bold, color: colors.textSecondary },
  eliteHintCta: { fontSize: 12, fontWeight: weight.black, color: colors.gold },

  // Elite 전용
  eliteRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15 },
  eliteDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  eliteIcon: { width: 38, height: 38, borderRadius: radius.iconTile, backgroundColor: 'rgba(176,122,46,.12)', alignItems: 'center', justifyContent: 'center' },
  eliteTitle: { fontSize: 14, fontWeight: weight.black, color: colors.ink },
  eliteSub: { fontSize: 11, color: colors.textWeak, marginTop: 2 },
  unlimited: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.ink },
  unlimitedText: { fontSize: 10, fontWeight: weight.black, color: colors.goldLight },

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
