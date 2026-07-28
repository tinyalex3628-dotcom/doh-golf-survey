/**
 * 스윙 진행도 컨트롤 — 슬라이더 1개로 (비교 화면이면) 두 영상을 함께 움직인다.
 *
 * 값은 **진행도 0~1** (0=스윙 시작, 1=스윙 끝). 각 영상은 자기 구간으로 환산해 재생하므로
 * 영상 길이가 서로 달라도 같은 진행도 = 같은 스윙 국면이 된다.
 *
 * P1~P10 칩은 **참고용**이다. 엔진이 그 P를 검출했을 때만 활성(진행도 위치를 앎),
 * 못 잡았으면 흐리게 두고 못 누른다 — 억지로 균등 분할해 눌리게 하면 엉뚱한 데로 간다.
 * (P2/P6/P8은 샤프트 평행이라 클럽 검출 없이는 원리적으로 미검출)
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, radius, weight } from '../theme/tokens';
import { P_LABELS } from '../utils/swingTimeline';

export function PositionControls({
  progress,
  onProgress,
  markers,
  playing,
  onTogglePlay,
  dark = true,
  showButtons = false,
}: {
  progress: number;
  onProgress: (v: number) => void;
  /** P1~P10 각각의 진행도 위치(0~1) 또는 null(미검출). 없으면 칩 전부 비활성 */
  markers?: (number | null)[];
  playing?: boolean;
  onTogglePlay?: () => void;
  dark?: boolean;
  showButtons?: boolean;
}) {
  const m = markers ?? Array(10).fill(null);
  let activeP = -1;
  let best = Infinity;
  m.forEach((v, i) => {
    if (v == null) return;
    const d = Math.abs(v - progress);
    if (d < best && d < 0.06) {
      best = d;
      activeP = i;
    }
  });

  const step = (delta: number) => onProgress(Math.max(0, Math.min(1, progress + delta)));

  return (
    <View style={{ gap: 11 }}>
      {showButtons ? (
        <View style={styles.btnGrid}>
          {P_LABELS.map((l, i) => (
            <PChip key={l} label={l} on={i === activeP} at={m[i]} dark={dark} onPress={onProgress} big />
          ))}
        </View>
      ) : (
        <View style={styles.tickRow}>
          {P_LABELS.map((l, i) => (
            <PChip key={l} label={l} on={i === activeP} at={m[i]} dark={dark} onPress={onProgress} />
          ))}
        </View>
      )}

      <View style={styles.sliderRow}>
        <StepBtn label="◀" onPress={() => step(-0.02)} dark={dark} />
        {onTogglePlay ? <StepBtn label={playing ? '❚❚' : '▶'} onPress={onTogglePlay} dark={dark} wide /> : null}
        <Slider
          style={{ flex: 1, height: 36 }}
          minimumValue={0}
          maximumValue={1}
          value={progress}
          onValueChange={onProgress}
          minimumTrackTintColor={colors.goldLight}
          maximumTrackTintColor={dark ? 'rgba(247,244,236,.2)' : 'rgba(27,38,32,.15)'}
          thumbTintColor={colors.goldLight}
        />
        <StepBtn label="▶|" onPress={() => step(0.02)} dark={dark} />
      </View>
      <Text style={[styles.progressText, { color: dark ? 'rgba(247,244,236,.55)' : colors.textWeak }]}>
        스윙 진행 {Math.round(progress * 100)}%
      </Text>
    </View>
  );
}

function PChip({
  label,
  on,
  at,
  dark,
  onPress,
  big,
}: {
  label: string;
  on: boolean;
  at: number | null;
  dark: boolean;
  onPress: (v: number) => void;
  big?: boolean;
}) {
  const known = at != null;
  return (
    <Pressable
      disabled={!known}
      onPress={() => known && onPress(at as number)}
      style={[
        big ? styles.pBtn : styles.tick,
        {
          backgroundColor: on
            ? colors.goldLight
            : known
            ? dark
              ? 'rgba(247,244,236,.1)'
              : 'rgba(27,38,32,.05)'
            : 'transparent',
          opacity: known ? 1 : 0.32,
        },
      ]}
    >
      <Text
        style={{
          fontSize: big ? 11 : 9,
          fontWeight: weight.black,
          color: on ? colors.bezelBlack : dark ? 'rgba(247,244,236,.6)' : colors.ink,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StepBtn({ label, onPress, dark, wide }: { label: string; onPress: () => void; dark: boolean; wide?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.step,
        wide ? { width: 42 } : null,
        { backgroundColor: dark ? 'rgba(247,244,236,.1)' : 'rgba(27,38,32,.06)' },
      ]}
    >
      <Text style={{ fontSize: 12, color: dark ? colors.onDark : colors.ink }}>{label}</Text>
    </Pressable>
  );
}

export { P_LABELS as P10_LABELS };

const styles = StyleSheet.create({
  btnGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  pBtn: { width: '18.8%', paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  tickRow: { flexDirection: 'row', gap: 3 },
  tick: { flex: 1, paddingVertical: 5, borderRadius: 6, alignItems: 'center' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  step: { width: 34, height: 34, borderRadius: radius.iconTileSm, alignItems: 'center', justifyContent: 'center' },
  progressText: { fontSize: 10, textAlign: 'center', fontWeight: weight.bold },
});
