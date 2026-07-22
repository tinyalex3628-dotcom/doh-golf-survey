/**
 * P1–P10 포지션 틱 + 프레임 슬라이더 + ◀/▶ 스텝.
 * 슬라이더(0–100)와 pIdx(0–9)는 양방향 동기화.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, radius, weight } from '../theme/tokens';

const P10 = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'];

export function PositionControls({
  pIdx,
  frame,
  onP,
  onFrame,
  dark = true,
  showButtons = false,
}: {
  pIdx: number;
  frame: number;
  onP: (i: number) => void;
  onFrame: (v: number) => void;
  dark?: boolean;
  showButtons?: boolean; // true면 큰 P버튼(학습 UX), false면 작은 틱
}) {
  return (
    <View style={{ gap: 12 }}>
      {showButtons ? (
        <View style={styles.btnGrid}>
          {P10.map((l, i) => {
            const on = i === pIdx;
            return (
              <Pressable
                key={l}
                onPress={() => onP(i)}
                style={[
                  styles.pBtn,
                  { backgroundColor: on ? colors.goldLight : dark ? 'rgba(247,244,236,.1)' : 'rgba(27,38,32,.05)' },
                ]}
              >
                <Text style={{ fontSize: 11, fontWeight: weight.black, color: on ? colors.bezelBlack : dark ? colors.onDark : colors.ink }}>
                  {l}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.tickRow}>
          {P10.map((l, i) => {
            const on = i === pIdx;
            return (
              <Pressable key={l} onPress={() => onP(i)} style={[styles.tick, on && { backgroundColor: colors.goldLight }]}>
                <Text style={{ fontSize: 9, fontWeight: weight.black, color: on ? colors.bezelBlack : 'rgba(247,244,236,.55)' }}>
                  {l}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={styles.sliderRow}>
        <StepBtn label="◀" onPress={() => onFrame(Math.max(0, frame - 11))} dark={dark} />
        <Slider
          style={{ flex: 1, height: 36 }}
          minimumValue={0}
          maximumValue={100}
          value={frame}
          onValueChange={onFrame}
          minimumTrackTintColor={colors.goldLight}
          maximumTrackTintColor={dark ? 'rgba(247,244,236,.2)' : 'rgba(27,38,32,.15)'}
          thumbTintColor={colors.goldLight}
        />
        <StepBtn label="▶" onPress={() => onFrame(Math.min(100, frame + 11))} dark={dark} />
      </View>
    </View>
  );
}

function StepBtn({ label, onPress, dark }: { label: string; onPress: () => void; dark: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.step, { backgroundColor: dark ? 'rgba(247,244,236,.1)' : 'rgba(27,38,32,.06)' }]}>
      <Text style={{ fontSize: 12, color: dark ? colors.onDark : colors.ink }}>{label}</Text>
    </Pressable>
  );
}

export const P10_LABELS = P10;
export const frameToP = (frame: number) => Math.round((frame / 100) * 9);
export const pToFrame = (i: number) => Math.round((i / 9) * 100);

const styles = StyleSheet.create({
  btnGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  pBtn: { width: '18.8%', paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  tickRow: { flexDirection: 'row', gap: 3 },
  tick: { flex: 1, paddingVertical: 5, borderRadius: 6, alignItems: 'center' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  step: { width: 34, height: 34, borderRadius: radius.iconTileSm, alignItems: 'center', justifyContent: 'center' },
});
