import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Press, SectionLabel } from '../components/ui';
import { PositionControls } from '../components/PositionControls';
import { SwingStage } from '../components/SwingStage';
import { RangePicker } from '../components/RangePicker';
import { BottomSheet } from '../components/BottomSheet';
import { useSwingClip } from '../hooks/useSwingClip';
import { useComparison } from '../state/comparison';
import { getProClip } from '../data/proClips';
import { P_LABELS } from '../utils/swingTimeline';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';

export default function ProCompareScreen() {
  const { go } = useNav();
  const { showToast } = useToast();
  const { pro, cam } = useComparison();
  const [sheet, setSheet] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tuning, setTuning] = useState(false);

  // 프로 영상은 앱이 구간을 미리 잡아둔 것 → locked (사용자가 못 바꿈)
  const proInfo = getProClip(pro, cam);
  const proClip = useSwingClip({
    uri: proInfo.video,
    lockedRange: proInfo.range,
    knownDuration: proInfo.duration,
    pTimes: proInfo.pTimes,   // P구간은 프로만 — 운영자가 지정한 값
  });
  // 내 영상만 사용자가 시작/끝을 직접 찍는다
  const myClip = useSwingClip({});

  // 현재 진행도에 가까운 '검출된' P (없으면 % 로 표시)
  let nearP = -1;
  let best = Infinity;
  proClip.markers.forEach((v, i) => {
    if (v == null) return;
    const d = Math.abs(v - progress);
    if (d < best && d < 0.06) { best = d; nearP = i; }
  });
  const curP = nearP >= 0 ? P_LABELS[nearP] : `${Math.round(progress * 100)}%`;

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

  return (
    <Screen>
      <View style={styles.split}>
        <View style={{ flex: 1 }}>
          <SwingStage
            badge={`PRO ${curP}`}
            uri={proClip.uri}
            emptyText="프로 영상 준비 중"
            seekTime={proClip.timeAt(progress)}
            paused={!playing}
            onLoad={proClip.onLoad}
          />
          <Text style={styles.halfCaption}>{proInfo.name} · {proInfo.view}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <SwingStage
            badge={`ME ${curP}`}
            uri={myClip.uri}
            emptyText="내 스윙 영상 없음"
            seekTime={myClip.timeAt(progress)}
            paused={!playing}
            onLoad={myClip.onLoad}
          />
          <Text style={styles.halfCaption}>내 스윙</Text>
        </View>
      </View>

      <View style={styles.syncBadge}>
        <Text style={styles.syncText}>🔗 스윙 구간 기준 동기화</Text>
      </View>

      <View style={styles.panel}>
        <SectionLabel style={{ color: colors.goldLight, letterSpacing: 0.5, marginBottom: 9 }}>
          스윙 진행도 · 양쪽 슬라이드바 연동
        </SectionLabel>
        <PositionControls
          progress={progress}
          onProgress={(v) => { setPlaying(false); setProgress(v); }}
          markers={proClip.markers}
          playing={playing}
          onTogglePlay={() => setPlaying((v) => !v)}
          dark
          showButtons
        />
        <View style={{ flexDirection: 'row', gap: 7, marginTop: 8 }}>
          <Press activeScale={0.97} onPress={() => setTuning((v) => !v)} style={styles.panelBtn}>
            <Text style={styles.panelBtnText}>{tuning ? '구간 닫기' : '⇔ 싱크'}</Text>
          </Press>
          <Press activeScale={0.97} onPress={() => showToast('선을 그렸어요')} style={styles.panelBtn}>
            <Text style={styles.panelBtnText}>✎ 선 그리기</Text>
          </Press>
          <Press activeScale={0.97} onPress={() => showToast('두 프레임을 캡처했어요')} style={styles.panelBtn}>
            <Text style={styles.panelBtnText}>📷 캡처</Text>
          </Press>
        </View>
      </View>

      {tuning ? (
        <View style={{ marginTop: 10, gap: 10 }}>
          <RangePicker
            label={`${proInfo.name} 프로`}
            range={proClip.range}
            duration={proClip.duration}
            scrubTime={proClip.scrubTime}
            onScrub={proClip.setScrub}
            onSetStart={proClip.markStart}
            onSetEnd={proClip.markEnd}
            onReset={proClip.reset}
          />
          <RangePicker
            label="내 스윙"
            range={myClip.range}
            duration={myClip.duration}
            scrubTime={myClip.scrubTime}
            onScrub={myClip.setScrub}
            onSetStart={() => { myClip.markStart(); showToast('내 스윙 시작 지점을 정했어요'); }}
            onSetEnd={() => { myClip.markEnd(); showToast('내 스윙 끝 지점을 정했어요'); }}
            onReset={myClip.reset}
          />
        </View>
      ) : null}

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

const styles = StyleSheet.create({
  split: { flexDirection: 'row', gap: 8 },
  halfCaption: { fontSize: 10.5, color: colors.textWeak, marginTop: 5, fontWeight: weight.bold, textAlign: 'center' },
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
