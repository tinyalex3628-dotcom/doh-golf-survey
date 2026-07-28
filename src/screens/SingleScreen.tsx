import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Card, Press } from '../components/ui';
import { SwingStage } from '../components/SwingStage';
import { PositionControls } from '../components/PositionControls';
import { RangePicker } from '../components/RangePicker';
import { useSwingClip } from '../hooks/useSwingClip';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';
import { RouteName, RootStackParamList } from '../navigation/pages';
import { P_LABELS } from '../utils/swingTimeline';

export default function SingleScreen() {
  const { go } = useNav();
  const { showToast } = useToast();
  const route = useRoute<RouteProp<RootStackParamList, 'single'>>();

  const clip = useSwingClip({ uri: route.params?.swing?.uri });
  const [line, setLine] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tuning, setTuning] = useState(false);

  // 재생: 사용자가 정한 구간 안에서만 돈다
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + 0.012;
        if (next >= 1) {
          setPlaying(false);
          return 1;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(id);
  }, [playing]);

  // 현재 진행도에 가장 가까운 '검출된' P (없으면 표시 안 함)
  let nearP = -1;
  let best = Infinity;
  clip.markers.forEach((v, i) => {
    if (v == null) return;
    const d = Math.abs(v - progress);
    if (d < best && d < 0.06) {
      best = d;
      nearP = i;
    }
  });

  const jumps: { label: string; route: RouteName }[] = [
    { label: '프로와 비교하기', route: 'hub2' },
    { label: '프로에게 물어보기', route: 'feedback' },
  ];

  return (
    <Screen>
      <SwingStage
        uri={clip.uri}
        seekTime={clip.timeAt(progress)}
        paused={!playing}
        showLine={line}
        angleText="32°"
        badge={line ? '선 그리기 ON' : undefined}
        onLoad={clip.onLoad}
      >
        <View style={styles.topControls}>
          <Press activeScale={0.95} onPress={() => setLine((v) => !v)} style={[styles.miniBtn, line && styles.miniBtnOn]}>
            <Text style={[styles.miniBtnText, line && { color: colors.bezelBlack }]}>✎ 선 그리기</Text>
          </Press>
          <Press activeScale={0.95} onPress={() => showToast('프레임을 캡처했어요')} style={styles.miniBtn}>
            <Text style={styles.miniBtnText}>📷 캡처</Text>
          </Press>
        </View>
      </SwingStage>

      <View style={styles.panel}>
        <PositionControls
          progress={progress}
          onProgress={(v) => {
            setPlaying(false);
            setProgress(v);
          }}
          markers={clip.markers}
          playing={playing}
          onTogglePlay={() => setPlaying((v) => !v)}
          dark
        />
        <Press activeScale={0.97} onPress={() => setTuning((v) => !v)} style={styles.tuneBtn}>
          <Text style={styles.tuneText}>{tuning ? '구간 조정 닫기' : '⇔ 스윙 구간 정하기'}</Text>
        </Press>
      </View>

      {tuning ? (
        <View style={{ marginTop: 10 }}>
          <RangePicker
            label="내 스윙"
            range={clip.range}
            duration={clip.duration}
            scrubTime={clip.scrubTime}
            onScrub={clip.setScrub}
            onSetStart={() => {
              clip.markStart();
              showToast('스윙 시작 지점을 정했어요');
            }}
            onSetEnd={() => {
              clip.markEnd();
              showToast('스윙 끝 지점을 정했어요');
            }}
            onReset={clip.reset}
          />
        </View>
      ) : null}

      <Card style={{ padding: 15, marginTop: 12 }}>
        <Text style={styles.fbLabel}>AI 피드백 · 참고용</Text>
        <Text style={styles.fbBody}>
          {nearP >= 0
            ? `현재 ${P_LABELS[nearP]} 구간이에요. 임팩트 전후로 골반이 먼저 리드되는지 확인해 보세요. (실제 분석 준비 중)`
            : `스윙 진행 ${Math.round(progress * 100)}% 지점이에요. 분석을 돌리면 P1~P10 구간이 표시됩니다.`}
        </Text>
      </Card>

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
  tuneBtn: {
    marginTop: 10,
    paddingVertical: 11,
    borderRadius: radius.iconTile,
    backgroundColor: 'rgba(247,244,236,.1)',
    alignItems: 'center',
  },
  tuneText: { color: colors.onDark, fontSize: 12.5, fontWeight: weight.black },
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
