/**
 * 스윙 구간 지정 — 사용자가 "스윙 시작"과 "스윙 끝"을 직접 찍는다.
 *
 * 왜 자동이 아니라 수동인가: 엔진의 P시점 검출은 클럽이 없으면 P2/P6/P8을 못 잡고,
 * P3/P5도 실패하면 P4와 같은 프레임으로 뭉갠다. 검출이 흔들리면 싱크가 통째로 어긋난다.
 * 사용자가 찍은 두 점은 안 흔들린다.
 *
 * 프로 영상(locked)은 앱이 미리 구간을 잡아둔 것 → 조작 UI를 아예 숨긴다.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Press } from './ui';
import { colors, radius, weight } from '../theme/tokens';
import { SwingRange, fmtTime, rangeDuration } from '../utils/swingTimeline';

export function RangePicker({
  label,
  range,
  duration,
  scrubTime,
  onScrub,
  onSetStart,
  onSetEnd,
  onReset,
}: {
  label: string;
  range: SwingRange;
  duration: number;
  /** 구간 지정용 원본 탐색 위치(초) */
  scrubTime: number;
  onScrub: (t: number) => void;
  onSetStart: () => void;
  onSetEnd: () => void;
  onReset: () => void;
}) {
  if (range.locked) {
    return (
      <View style={styles.lockedBox}>
        <Text style={styles.lockedText}>
          🔒 {label} · 스윙 구간 고정 ({fmtTime(range.start)}~{fmtTime(range.end)})
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <View style={styles.headRow}>
        <Text style={styles.title}>{label} · 스윙 구간 정하기</Text>
        <Press onPress={onReset} activeScale={0.95} style={styles.resetBtn}>
          <Text style={styles.resetText}>초기화</Text>
        </Press>
      </View>
      <Text style={styles.hint}>영상을 움직여 스윙이 시작·끝나는 지점에서 아래 버튼을 누르세요.</Text>

      <Slider
        style={{ width: '100%', height: 34 }}
        minimumValue={0}
        maximumValue={Math.max(0.1, duration)}
        value={scrubTime}
        onValueChange={onScrub}
        minimumTrackTintColor={colors.goldLight}
        maximumTrackTintColor="rgba(247,244,236,.2)"
        thumbTintColor={colors.goldLight}
      />
      <Text style={styles.scrubText}>현재 {fmtTime(scrubTime)} / 전체 {fmtTime(duration)}</Text>

      <View style={styles.btnRow}>
        <Press onPress={onSetStart} activeScale={0.96} style={styles.markBtn}>
          <Text style={styles.markText}>⟨ 여기가 시작</Text>
        </Press>
        <Press onPress={onSetEnd} activeScale={0.96} style={styles.markBtn}>
          <Text style={styles.markText}>여기가 끝 ⟩</Text>
        </Press>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          시작 {fmtTime(range.start)} · 끝 {fmtTime(range.end)} · 길이 {rangeDuration(range).toFixed(1)}초
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.darkestGreen, borderRadius: radius.card, padding: 13, gap: 6 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 11, fontWeight: weight.black, color: colors.goldLight, letterSpacing: 0.4 },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(247,244,236,.1)' },
  resetText: { fontSize: 10, color: colors.onDark, fontWeight: weight.bold },
  hint: { fontSize: 10.5, color: 'rgba(247,244,236,.6)', lineHeight: 15 },
  scrubText: { fontSize: 10, color: 'rgba(247,244,236,.6)', textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 7, marginTop: 2 },
  markBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.iconTileSm,
    backgroundColor: 'rgba(237,217,163,.16)',
    alignItems: 'center',
  },
  markText: { color: colors.goldLight, fontSize: 12, fontWeight: weight.black },
  summary: { marginTop: 4, paddingTop: 7, borderTopWidth: 1, borderTopColor: 'rgba(247,244,236,.12)' },
  summaryText: { fontSize: 10.5, color: colors.onDark, fontWeight: weight.bold, textAlign: 'center' },
  // 이 박스는 밝은 화면 배경 위에 놓인다 — 어두운 패널용 색을 쓰면 흰 글씨가 안 보인다(검수에서 잡힘)
  lockedBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  lockedText: { fontSize: 11, color: colors.textSecondary, fontWeight: weight.bold, textAlign: 'center' },
});
