import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Press, SectionLabel } from '../components/ui';
import { PositionControls, P10_LABELS, frameToP, pToFrame } from '../components/PositionControls';
import { BottomSheet } from '../components/BottomSheet';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';

export default function ProCompareScreen() {
  const { go } = useNav();
  const { showToast } = useToast();
  const [pIdx, setPIdx] = useState(3);
  const [frame, setFrame] = useState(38);
  const [sheet, setSheet] = useState(false);
  const curP = P10_LABELS[pIdx];

  const setFromP = (i: number) => { setPIdx(i); setFrame(pToFrame(i)); };
  const setFromFrame = (v: number) => { setFrame(v); setPIdx(frameToP(v)); };

  return (
    <Screen>
      <View style={styles.split}>
        <VideoHalf tag={`PRO ${curP}`} tagBg="rgba(237,217,163,.9)" colors={[colors.accentGreen, colors.darkestGreen]} ring="rgba(237,217,163,.3)" />
        <VideoHalf tag={`ME ${curP}`} tagBg="rgba(159,216,180,.9)" colors={[colors.highlightGreen, colors.darkestGreen]} ring="rgba(159,216,180,.3)" />
      </View>

      <View style={styles.syncBadge}>
        <Text style={styles.syncText}>🔗 프레임 동기화 ON</Text>
      </View>

      <View style={styles.panel}>
        <SectionLabel style={{ color: colors.goldLight, letterSpacing: 0.5, marginBottom: 9 }}>
          P1–P10 · 양쪽 슬라이드바 연동
        </SectionLabel>
        <PositionControls pIdx={pIdx} frame={frame} onP={setFromP} onFrame={setFromFrame} dark showButtons />
        <View style={{ flexDirection: 'row', gap: 7, marginTop: 8 }}>
          <Press activeScale={0.97} onPress={() => showToast('선을 그렸어요')} style={styles.panelBtn}>
            <Text style={styles.panelBtnText}>✎ 선 그리기</Text>
          </Press>
          <Press activeScale={0.97} onPress={() => showToast('두 프레임을 캡처했어요')} style={styles.panelBtn}>
            <Text style={styles.panelBtnText}>📷 캡처</Text>
          </Press>
        </View>
      </View>

      <Press onPress={() => setSheet(true)} activeScale={0.99} style={styles.askRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.askTitle}>프로와 똑같이 해야 하나요?</Text>
          <Text style={styles.askSub}>궁금하다면 눌러보세요</Text>
        </View>
        <View style={styles.askMark}>
          <Text style={{ color: colors.gold, fontWeight: weight.black }}>?</Text>
        </View>
      </Press>

      <BottomSheet visible={sheet} onClose={() => setSheet(false)}>
        <SectionLabel style={{ color: colors.gold, letterSpacing: 1 }}>궁금증 · 자주 묻는 질문</SectionLabel>
        <Text style={styles.sheetTitle}>프로와 똑같이{'\n'}해야 하나요?</Text>
        <Text style={styles.sheetBody}>
          모든 골퍼가 프로와 같은 스윙을 해야 하는 것은 아닙니다. <Text style={{ color: colors.ink, fontWeight: weight.black }}>체형, 유연성, 운동능력, 신체 조건</Text>에 따라 최적의 스윙은 달라질 수 있어요.
        </Text>
        <Press
          onPress={() => { setSheet(false); go('feedback'); }}
          activeScale={0.99}
          style={styles.sheetProRow}
        >
          <View style={styles.sheetAvatar}>
            <Text style={{ fontSize: 8, color: 'rgba(27,38,32,.5)' }}>PRO</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetProTitle}>내 몸에 맞는 스윙, 프로에게 문의</Text>
            <Text style={styles.sheetProSub}>→ Membership으로 자연스럽게</Text>
          </View>
          <Text style={{ color: colors.gold, fontSize: 15 }}>›</Text>
        </Press>
        <Press onPress={() => setSheet(false)} activeScale={0.99} style={styles.sheetClose}>
          <Text style={styles.sheetCloseText}>이해했어요</Text>
        </Press>
      </BottomSheet>
    </Screen>
  );
}

function VideoHalf({
  tag,
  tagBg,
  colors: grad,
  ring,
}: {
  tag: string;
  tagBg: string;
  colors: readonly [string, string];
  ring: string;
}) {
  return (
    <LinearGradient colors={grad} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.half}>
      <View style={[styles.halfTag, { backgroundColor: tagBg }]}>
        <Text style={styles.halfTagText}>{tag}</Text>
      </View>
      <View style={[styles.halfSilhouette, { borderColor: ring }]} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  split: { flexDirection: 'row', gap: 8 },
  half: { flex: 1, aspectRatio: 3 / 5, borderRadius: 13, overflow: 'hidden' },
  halfTag: { position: 'absolute', top: 7, left: 7, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 100 },
  halfTagText: { color: colors.bezelBlack, fontSize: 9, fontWeight: weight.black },
  halfSilhouette: {
    position: 'absolute',
    left: '28%',
    top: '15%',
    width: '44%',
    height: '74%',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    backgroundColor: 'rgba(247,244,236,.14)',
    borderWidth: 1,
  },
  syncBadge: { alignSelf: 'center', marginTop: 9, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, backgroundColor: 'rgba(46,92,68,.09)' },
  syncText: { fontSize: 11, fontWeight: weight.black, color: colors.accentGreen },
  panel: { marginTop: 10, backgroundColor: colors.ink, borderRadius: radius.chip, padding: 13 },
  panelBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, backgroundColor: 'rgba(247,244,236,.14)', alignItems: 'center' },
  panelBtnText: { color: colors.onDark, fontSize: 11, fontWeight: weight.black },
  askRow: {
    marginTop: 12,
    padding: 14,
    borderRadius: radius.chip,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
  },
  askTitle: { fontSize: 13.5, fontWeight: weight.black, color: colors.ink },
  askSub: { fontSize: 10.5, color: colors.textSecondary, marginTop: 1 },
  askMark: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(176,122,46,.14)', alignItems: 'center', justifyContent: 'center' },

  sheetTitle: { fontSize: 21, fontWeight: weight.black, color: colors.ink, marginTop: 6, letterSpacing: -0.4, lineHeight: 27 },
  sheetBody: { fontSize: 13, lineHeight: 22, color: 'rgba(27,38,32,.72)', marginTop: 12 },
  sheetProRow: {
    marginTop: 16,
    padding: 14,
    borderRadius: radius.chip,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(27,38,32,.3)', alignItems: 'center', justifyContent: 'center' },
  sheetProTitle: { fontSize: 12.5, fontWeight: weight.black, color: colors.ink },
  sheetProSub: { fontSize: 10.5, color: colors.textSecondary, marginTop: 1 },
  sheetClose: { marginTop: 10, paddingVertical: 13, borderRadius: radius.iconTile, backgroundColor: colors.ink, alignItems: 'center' },
  sheetCloseText: { color: colors.onDark, fontSize: 13.5, fontWeight: weight.black },
});
