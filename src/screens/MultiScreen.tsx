import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/ui';
import { SwingStage } from '../components/SwingStage';
import { PositionControls, frameToP, pToFrame } from '../components/PositionControls';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';

export default function MultiScreen() {
  const { go } = useNav();
  const { showToast } = useToast();
  const [pIdx, setPIdx] = useState(3);
  const [frame, setFrame] = useState(38);

  const setFromP = (i: number) => { setPIdx(i); setFrame(pToFrame(i)); };
  const setFromFrame = (v: number) => { setFrame(v); setPIdx(frameToP(v)); };

  return (
    <Screen>
      <View style={styles.syncBadge}>
        <Text style={styles.syncText}>◎ 프레임 동기화 ON</Text>
      </View>

      <View style={styles.split}>
        <View style={styles.half}>
          <SwingStage badge="과거" />
          <Text style={styles.caption}>6월 · 드라이버</Text>
        </View>
        <View style={styles.half}>
          <SwingStage badge="현재" />
          <Text style={styles.caption}>이번 주 · 드라이버</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>공통 컨트롤 · 양쪽 동기화</Text>
        <PositionControls pIdx={pIdx} frame={frame} onP={setFromP} onFrame={setFromFrame} dark />
        <Press activeScale={0.97} onPress={() => showToast('두 프레임을 캡처했어요')} style={styles.captureBtn}>
          <Text style={styles.captureText}>📷 양쪽 캡처</Text>
        </Press>
      </View>

      <View style={{ gap: 8, marginTop: 12 }}>
        <Press onPress={() => go('hub2')} activeScale={0.99} style={styles.jumpRow}>
          <Text style={styles.jumpText}>프로와 비교하기</Text>
          <Text style={{ color: colors.textDisabled, fontSize: 17 }}>›</Text>
        </Press>
        <Press onPress={() => go('feedback')} activeScale={0.99} style={styles.jumpRow}>
          <Text style={styles.jumpText}>프로에게 물어보기</Text>
          <Text style={{ color: colors.textDisabled, fontSize: 17 }}>›</Text>
        </Press>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  syncBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, backgroundColor: 'rgba(46,92,68,.12)', marginBottom: 10 },
  syncText: { fontSize: 11, fontWeight: weight.black, color: colors.accentGreen },
  split: { flexDirection: 'row', gap: 9 },
  half: { flex: 1 },
  caption: { fontSize: 11, color: colors.textWeak, marginTop: 6, fontWeight: weight.bold, textAlign: 'center' },
  panel: { marginTop: 12, backgroundColor: colors.darkestGreen, borderRadius: radius.card, padding: 14 },
  panelLabel: { fontSize: 9.5, fontWeight: weight.black, color: colors.goldLight, letterSpacing: 0.5, marginBottom: 12 },
  captureBtn: { marginTop: 12, paddingVertical: 12, borderRadius: radius.iconTile, backgroundColor: 'rgba(247,244,236,.1)', alignItems: 'center' },
  captureText: { color: colors.onDark, fontSize: 12.5, fontWeight: weight.black },
  jumpRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.chip, paddingVertical: 14, paddingHorizontal: 16 },
  jumpText: { fontSize: 13.5, fontWeight: weight.black, color: colors.ink },
});
