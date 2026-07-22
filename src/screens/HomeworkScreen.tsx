import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, DarkCard, GhostButton, Press, PrimaryButton, ProgressBar, SectionLabel } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { t as tt } from '../components/ui';

type HwState = 'empty' | 'has' | 'done' | 'confused';

const HW_TABS: { key: HwState; label: string }[] = [
  { key: 'empty', label: '숙제 없음' },
  { key: 'has', label: '이번 주' },
  { key: 'done', label: '다 했어요' },
  { key: 'confused', label: '모르겠어요' },
];

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
  const [state, setState] = useState<HwState>('has');

  return (
    <Screen>
      <View style={{ paddingHorizontal: 2 }}>
        <Text style={tt.screenTitle}>이번 주 목표 숙제</Text>
        <Text style={tt.subtitle}>이도형 프로가 내준 숙제를 확인하고 수행해요.</Text>
      </View>

      {/* 상태 탭 */}
      <View style={styles.segment}>
        {HW_TABS.map((tab) => {
          const on = tab.key === state;
          return (
            <Press
              key={tab.key}
              activeScale={1}
              onPress={() => setState(tab.key)}
              style={[styles.segItem, on && styles.segItemOn]}
            >
              <Text style={[styles.segLabel, { color: on ? colors.ink : colors.textWeak }]}>{tab.label}</Text>
            </Press>
          );
        })}
      </View>

      {state === 'empty' && (
        <>
          <View style={styles.centerBlock}>
            <View style={[styles.emojiCircle, { backgroundColor: 'rgba(27,38,32,.05)' }]}>
              <Text style={{ fontSize: 30 }}>📭</Text>
            </View>
            <Text style={styles.blockTitle}>아직 받은 숙제가 없어요</Text>
            <Text style={styles.blockDesc}>먼저 스윙을 보내면 프로가{'\n'}나에게 맞는 숙제를 만들어드려요.</Text>
          </View>
          <PrimaryButton label="스윙 전송하기 ›" onPress={() => go('upload')} />
          <GhostButton
            label="숙제는 어떻게 받나요? · 구독 안내"
            onPress={() => go('subscription')}
            style={{ marginTop: 10 }}
          />
        </>
      )}

      {state === 'has' && (
        <>
          <View style={{ gap: 11, marginTop: 16 }}>
            {HW_ITEMS.map((h) => (
              <Card key={h.title} style={{ padding: 16 }}>
                <View style={styles.itemHead}>
                  <Text style={styles.itemTitle}>{h.title}</Text>
                  <Text style={styles.itemDue}>{h.due}</Text>
                </View>
                <Text style={styles.itemDesc}>{h.desc}</Text>
                <View style={{ marginTop: 11 }}>
                  <ProgressBar value={h.prog} height={6} />
                </View>
              </Card>
            ))}
          </View>
          <SectionLabel style={{ marginTop: 18 }}>숙제, 어떻게 할까요?</SectionLabel>
          <Press onPress={() => go('upload')} activeScale={0.99} style={[styles.actionRow, styles.actionDark]}>
            <Text style={styles.actionDarkText}>숙제 다 했어요 — 스윙 업로드</Text>
            <Text style={{ color: colors.onDark }}>›</Text>
          </Press>
          <Press onPress={() => go('subscription')} activeScale={0.99} style={[styles.actionRow, styles.actionGold]}>
            <Text style={styles.actionGoldText}>숙제 중 잘 모르겠어요 — 문의하기</Text>
            <Text style={{ color: colors.gold }}>›</Text>
          </Press>
        </>
      )}

      {state === 'done' && (
        <>
          <DarkCard style={{ marginTop: 18, padding: 24, alignItems: 'center' }}>
            <View style={[styles.emojiCircle, { width: 64, height: 64, backgroundColor: 'rgba(237,217,163,.16)' }]}>
              <Text style={{ fontSize: 28 }}>🎉</Text>
            </View>
            <Text style={[styles.blockTitle, { color: colors.onDark }]}>이번 주 숙제, 다 하셨네요!</Text>
            <Text style={[styles.blockDesc, { color: 'rgba(247,244,236,.65)' }]}>
              완료한 스윙을 남겨두면 프로가 확인하고{'\n'}다음 숙제를 만들어드려요.
            </Text>
          </DarkCard>
          <Press onPress={() => go('upload')} activeScale={0.99} style={styles.goldBtn}>
            <Text style={styles.goldBtnText}>스윙 업로드하기 ›</Text>
          </Press>
          <GhostButton label="다음 숙제 더 받고 싶어요" onPress={() => go('subscription')} style={{ marginTop: 10 }} />
        </>
      )}

      {state === 'confused' && (
        <>
          <View style={styles.centerBlock}>
            <View style={[styles.emojiCircle, { backgroundColor: 'rgba(176,122,46,.12)' }]}>
              <Text style={{ fontSize: 30, color: colors.gold }}>？</Text>
            </View>
            <Text style={styles.blockTitle}>숙제 중 잘 모르겠는 게 있나요?</Text>
            <Text style={styles.blockDesc}>혼자 고민하지 말고, 프로에게{'\n'}바로 물어볼 수 있어요.</Text>
          </View>
          <View style={styles.quote}>
            <Text style={styles.quoteText}>"골반 먼저 리드하라는데, 어떤 느낌인지 잘 모르겠어요."</Text>
          </View>
          <PrimaryButton label="문의하기 ›" onPress={() => go('subscription')} style={{ marginTop: 12 }} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 14,
    backgroundColor: 'rgba(27,38,32,.05)',
    padding: 4,
    borderRadius: 12,
  },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 9 },
  segItemOn: {
    backgroundColor: colors.surface,
    shadowColor: colors.bezelBlack,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segLabel: { fontSize: 11.5, fontWeight: weight.black },
  centerBlock: { alignItems: 'center', marginTop: 18, paddingVertical: 24, paddingHorizontal: 16 },
  emojiCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  blockTitle: { fontSize: 17, fontWeight: weight.black, color: colors.ink, marginTop: 14, textAlign: 'center' },
  blockDesc: { fontSize: 12.5, color: colors.textSecondary, marginTop: 6, lineHeight: 19, textAlign: 'center' },
  itemHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  itemTitle: { fontSize: 15, fontWeight: weight.black, color: colors.ink, flex: 1, lineHeight: 20 },
  itemDue: { marginLeft: 10, fontSize: 11, fontWeight: weight.black, color: colors.gold },
  itemDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 5, lineHeight: 18 },
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
  goldBtn: { marginTop: 12, paddingVertical: 15, borderRadius: radius.chip, alignItems: 'center', backgroundColor: colors.goldLight },
  goldBtnText: { fontSize: 14, fontWeight: weight.black, color: colors.darkestGreen },
  quote: {
    backgroundColor: 'rgba(27,38,32,.04)',
    borderRadius: radius.button,
    padding: 14,
  },
  quoteText: { fontSize: 12.5, color: 'rgba(27,38,32,.6)', lineHeight: 20 },
});
