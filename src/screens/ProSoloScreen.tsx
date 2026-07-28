import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, PrimaryButton } from '../components/ui';
import { SwingStage } from '../components/SwingStage';
import { PositionControls } from '../components/PositionControls';
import { useSwingClip } from '../hooks/useSwingClip';
import { getProClip } from '../data/proClips';
import { P_LABELS } from '../utils/swingTimeline';
import { colors, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { PRO_NAMES, useComparison } from '../state/comparison';

export default function ProSoloScreen() {
  const { go } = useNav();
  const { pro, cam } = useComparison();
  const proName = pro ? PRO_NAMES[pro] : '이도형';

  // 프로 영상 — 구간은 앱이 미리 잡아둔 값(locked)
  const info = getProClip(pro, cam);
  const clip = useSwingClip({ uri: info.uri, lockedRange: info.range, knownDuration: info.duration });
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + 0.012;
        if (next >= 1) { setPlaying(false); return 1; }
        return next;
      });
    }, 50);
    return () => clearInterval(id);
  }, [playing]);

  let nearP = -1;
  let best = Infinity;
  clip.markers.forEach((v, i) => {
    if (v == null) return;
    const d = Math.abs(v - progress);
    if (d < best && d < 0.06) { best = d; nearP = i; }
  });

  return (
    <Screen>
      <SwingStage
        badge={`${proName} · ${cam ?? '정면'}`}
        uri={clip.uri}
        seekTime={clip.timeAt(progress)}
        paused={!playing}
        onLoad={clip.onLoad}
      >
        <View style={styles.posLabel}>
          <Text style={styles.posLabelText}>
            {nearP >= 0 ? `현재 포지션 · ${P_LABELS[nearP]}` : `스윙 진행 ${Math.round(progress * 100)}%`}
          </Text>
        </View>
      </SwingStage>

      <Card style={{ padding: 13, marginTop: 10 }}>
        <View style={styles.cardHead}>
          <Text style={styles.cardHeadLabel}>P1–P10 · 슬라이드바 연동</Text>
          <Text style={styles.cardHeadHint}>Address → Finish</Text>
        </View>
        <View style={{ marginTop: 9 }}>
          <PositionControls
            progress={progress}
            onProgress={(v) => { setPlaying(false); setProgress(v); }}
            markers={clip.markers}
            playing={playing}
            onTogglePlay={() => setPlaying((v) => !v)}
            dark={false}
            showButtons
          />
        </View>
        <Text style={styles.learnHint}>
          버튼을 누르면 슬라이드바가 그 포지션으로 이동해요. 분석 전이라 P구간을 모르면 흐리게 표시돼요.
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
