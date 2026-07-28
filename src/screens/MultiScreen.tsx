import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Press } from '../components/ui';
import { SwingStage } from '../components/SwingStage';
import { PositionControls } from '../components/PositionControls';
import { RangePicker } from '../components/RangePicker';
import { useSwingClip } from '../hooks/useSwingClip';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';
import { RootStackParamList } from '../navigation/pages';

export default function MultiScreen() {
  const { navigation, go } = useNav();
  const { showToast } = useToast();
  const route = useRoute<RouteProp<RootStackParamList, 'multi'>>();
  const past = route.params?.pastSwing ?? { label: '6월 · 드라이버', club: '드라이버', side: '정면' };

  // 두 영상 각각 자기 구간을 갖는다. 사용자가 시작/끝을 직접 찍는다.
  const pastClip = useSwingClip({ uri: route.params?.pastSwing?.uri });
  const nowClip = useSwingClip({ uri: route.params?.currentSwing?.uri });

  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tuning, setTuning] = useState(false);

  // 갤러리에서 과거 스윙을 새로 골라 돌아왔을 때 안내
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (route.params?.pastSwing) showToast(`과거 스윙을 '${route.params.pastSwing.label}'로 바꿨어요`);
  }, [route.params?.pastSwing?.label]);

  // 재생 중 진행도 자동 증가 (두 영상이 같은 진행도를 공유)
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

  return (
    <Screen>
      <View style={{ paddingHorizontal: 2, marginBottom: 12 }}>
        <Text style={styles.title}>과거 스윙과 비교</Text>
        <Text style={styles.subtitle}>예전 스윙을 골라 지금 스윙과 나란히 놓고 봐요.</Text>
      </View>

      <View style={styles.syncBadge}>
        <Text style={styles.syncText}>◎ 스윙 구간 기준 동기화</Text>
      </View>

      <View style={styles.split}>
        <View style={styles.half}>
          <SwingStage
            badge="과거"
            uri={pastClip.uri}
            seekTime={pastClip.timeAt(progress)}
            paused={!playing}
            onLoad={pastClip.onLoad}
          />
          <Press
            activeScale={0.97}
            onPress={() => navigation.navigate('gallery', { mode: 'pickForCompare' })}
            style={styles.pickPast}
          >
            <Text style={styles.pickPastText}>{past.label}</Text>
            <Text style={styles.pickPastChange}>바꾸기 ›</Text>
          </Press>
        </View>
        <View style={styles.half}>
          <SwingStage
            badge="현재"
            uri={nowClip.uri}
            seekTime={nowClip.timeAt(progress)}
            paused={!playing}
            onLoad={nowClip.onLoad}
          />
          <Text style={styles.caption}>이번 주 · 드라이버</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>공통 컨트롤 · 양쪽 동기화</Text>
        <PositionControls
          progress={progress}
          onProgress={(v) => {
            setPlaying(false);
            setProgress(v);
          }}
          markers={pastClip.markers}
          playing={playing}
          onTogglePlay={() => setPlaying((v) => !v)}
          dark
        />
        <View style={{ flexDirection: 'row', gap: 7, marginTop: 10 }}>
          <Press activeScale={0.97} onPress={() => setTuning((v) => !v)} style={styles.panelBtn}>
            <Text style={styles.panelBtnText}>{tuning ? '구간 조정 닫기' : '⇔ 싱크 맞추기'}</Text>
          </Press>
          <Press activeScale={0.97} onPress={() => showToast('두 프레임을 캡처했어요')} style={styles.panelBtn}>
            <Text style={styles.panelBtnText}>📷 양쪽 캡처</Text>
          </Press>
        </View>
      </View>

      {tuning ? (
        <ScrollView style={{ marginTop: 10 }} contentContainerStyle={{ gap: 10 }}>
          <RangePicker
            label="과거 스윙"
            range={pastClip.range}
            duration={pastClip.duration}
            scrubTime={pastClip.scrubTime}
            onScrub={pastClip.setScrub}
            onSetStart={() => {
              pastClip.markStart();
              showToast('과거 스윙 시작 지점을 정했어요');
            }}
            onSetEnd={() => {
              pastClip.markEnd();
              showToast('과거 스윙 끝 지점을 정했어요');
            }}
            onReset={pastClip.reset}
          />
          <RangePicker
            label="현재 스윙"
            range={nowClip.range}
            duration={nowClip.duration}
            scrubTime={nowClip.scrubTime}
            onScrub={nowClip.setScrub}
            onSetStart={() => {
              nowClip.markStart();
              showToast('현재 스윙 시작 지점을 정했어요');
            }}
            onSetEnd={() => {
              nowClip.markEnd();
              showToast('현재 스윙 끝 지점을 정했어요');
            }}
            onReset={nowClip.reset}
          />
        </ScrollView>
      ) : null}

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
  title: { fontSize: 20, fontWeight: weight.black, letterSpacing: -0.4, color: colors.ink },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  syncBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: 'rgba(46,92,68,.12)',
    marginBottom: 10,
  },
  syncText: { fontSize: 11, fontWeight: weight.black, color: colors.accentGreen },
  split: { flexDirection: 'row', gap: 9 },
  half: { flex: 1 },
  caption: { fontSize: 11, color: colors.textWeak, marginTop: 6, fontWeight: weight.bold, textAlign: 'center' },
  pickPast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(176,122,46,.1)',
  },
  pickPastText: { fontSize: 11, color: colors.ink, fontWeight: weight.bold },
  pickPastChange: { fontSize: 11, color: colors.gold, fontWeight: weight.black },
  panel: { marginTop: 12, backgroundColor: colors.darkestGreen, borderRadius: radius.card, padding: 14 },
  panelLabel: { fontSize: 9.5, fontWeight: weight.black, color: colors.goldLight, letterSpacing: 0.5, marginBottom: 12 },
  panelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radius.iconTile,
    backgroundColor: 'rgba(247,244,236,.1)',
    alignItems: 'center',
  },
  panelBtnText: { color: colors.onDark, fontSize: 12.5, fontWeight: weight.black },
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
});
