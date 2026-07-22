import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, Press } from '../components/ui';
import { SwingStage } from '../components/SwingStage';
import { PositionControls, frameToP, pToFrame } from '../components/PositionControls';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';
import { RouteName } from '../navigation/pages';

export default function SingleScreen() {
  const { go } = useNav();
  const { showToast } = useToast();
  const [line, setLine] = useState(false);
  const [pIdx, setPIdx] = useState(3);
  const [frame, setFrame] = useState(38);

  const setFromP = (i: number) => {
    setPIdx(i);
    setFrame(pToFrame(i));
  };
  const setFromFrame = (v: number) => {
    setFrame(v);
    setPIdx(frameToP(v));
  };

  const jumps: { label: string; route: RouteName }[] = [
    { label: '프로와 비교하기', route: 'hub2' },
    { label: '프로에게 물어보기', route: 'feedback' },
  ];

  return (
    <Screen>
      <SwingStage showLine={line} angleText="32°" badge={line ? '선 그리기 ON' : undefined}>
        <View style={styles.topControls}>
          <Press activeScale={0.95} onPress={() => setLine((v) => !v)} style={[styles.miniBtn, line && styles.miniBtnOn]}>
            <Text style={[styles.miniBtnText, line && { color: colors.bezelBlack }]}>✎ 선 그리기</Text>
          </Press>
          <Press activeScale={0.95} onPress={() => showToast('프레임을 캡처했어요')} style={styles.miniBtn}>
            <Text style={styles.miniBtnText}>📷 캡처</Text>
          </Press>
        </View>
      </SwingStage>

      {/* 컨트롤 패널 */}
      <View style={styles.panel}>
        <PositionControls pIdx={pIdx} frame={frame} onP={setFromP} onFrame={setFromFrame} dark />
      </View>

      {/* AI 피드백 */}
      <Card style={{ padding: 15, marginTop: 12 }}>
        <Text style={styles.fbLabel}>AI 피드백 · 참고용</Text>
        <Text style={styles.fbBody}>
          현재 {`P${pIdx + 1}`} 구간이에요. 임팩트 전후로 골반이 먼저 리드되는지 확인해 보세요. (실제 분석 준비 중)
        </Text>
      </Card>

      {/* 과거 내 스윙과 비교 — 강조 CTA */}
      <Press onPress={() => go('multi')} activeScale={0.99} style={{ marginTop: 12 }}>
        <View style={styles.compareRow}>
          <View style={styles.compareIcon}>
            <Text style={{ fontSize: 18 }}>⚖</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.compareTitle}>과거 내 스윙과 비교하기</Text>
            <Text style={styles.compareDesc}>갤러리에서 예전 스윙을 골라 나란히 놓고 봐요</Text>
          </View>
          <Text style={{ color: colors.gold, fontSize: 17 }}>›</Text>
        </View>
      </Press>

      <View style={{ gap: 8, marginTop: 12 }}>
        {jumps.map((j) => (
          <Press key={j.route} onPress={() => go(j.route)} activeScale={0.99} style={styles.jumpRow}>
            <Text style={styles.jumpText}>{j.label}</Text>
            <Text style={{ color: colors.textDisabled, fontSize: 17 }}>›</Text>
          </Press>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topControls: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', gap: 6 },
  miniBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100, backgroundColor: 'rgba(11,21,16,.7)' },
  miniBtnOn: { backgroundColor: colors.goldLight },
  miniBtnText: { color: colors.onDark, fontSize: 10.5, fontWeight: weight.black },
  panel: { marginTop: 12, backgroundColor: colors.darkestGreen, borderRadius: radius.card, padding: 14 },
  fbLabel: { fontSize: 9.5, fontWeight: weight.black, color: colors.gold, letterSpacing: 0.5 },
  fbBody: { fontSize: 13, color: colors.ink, marginTop: 4, lineHeight: 20, fontWeight: weight.bold },
  jumpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.chip,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  jumpText: { fontSize: 13.5, fontWeight: weight.black, color: colors.ink },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: radius.chip,
    padding: 15,
  },
  compareIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.iconTile,
    backgroundColor: 'rgba(176,122,46,.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareTitle: { fontSize: 14.5, fontWeight: weight.black, color: colors.ink },
  compareDesc: { fontSize: 11, color: colors.textSecondary, marginTop: 2, lineHeight: 15 },
});
