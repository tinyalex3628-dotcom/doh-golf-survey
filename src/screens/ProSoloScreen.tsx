import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, Press, PrimaryButton } from '../components/ui';
import { SwingStage } from '../components/SwingStage';
import { PositionControls, P10_LABELS, frameToP, pToFrame } from '../components/PositionControls';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { PRO_NAMES, useComparison } from '../state/comparison';

export default function ProSoloScreen() {
  const { go } = useNav();
  const { pro, cam } = useComparison();
  const proName = pro ? PRO_NAMES[pro] : '이도형';
  const [pIdx, setPIdx] = useState(3);
  const [frame, setFrame] = useState(38);

  const setFromP = (i: number) => { setPIdx(i); setFrame(pToFrame(i)); };
  const setFromFrame = (v: number) => { setFrame(v); setPIdx(frameToP(v)); };

  return (
    <Screen>
      <SwingStage badge={`${proName} · ${cam ?? '정면'}`}>
        <View style={styles.posLabel}>
          <Text style={styles.posLabelText}>현재 포지션 · {P10_LABELS[pIdx]}</Text>
        </View>
      </SwingStage>

      <Card style={{ padding: 13, marginTop: 10 }}>
        <View style={styles.cardHead}>
          <Text style={styles.cardHeadLabel}>P1–P10 · 슬라이드바 연동</Text>
          <Text style={styles.cardHeadHint}>Address → Finish</Text>
        </View>
        <View style={{ marginTop: 9 }}>
          <PositionControls pIdx={pIdx} frame={frame} onP={setFromP} onFrame={setFromFrame} dark={false} showButtons />
        </View>
        <Text style={styles.learnHint}>
          버튼을 누르면 슬라이드바가 그 포지션으로 이동해요. "P2가 어디지?"를 눈으로 익히는 학습 UX.
        </Text>
      </Card>

      <PrimaryButton label="프로와 내 스윙 비교하기 ›" onPress={() => go('proCompare')} style={{ marginTop: 12 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  posLabel: { position: 'absolute', bottom: 52, left: 10, right: 10, alignItems: 'center' },
  posLabelText: { color: colors.goldLight, fontSize: 12, fontWeight: weight.black },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 },
  cardHeadLabel: { fontSize: 9.5, fontWeight: weight.black, color: colors.gold, letterSpacing: 0.5 },
  cardHeadHint: { fontSize: 9, color: 'rgba(27,38,32,.4)', fontWeight: weight.bold },
  learnHint: { fontSize: 10.5, color: colors.textWeak, marginTop: 10, lineHeight: 16 },
});
