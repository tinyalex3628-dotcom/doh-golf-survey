import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Press } from './ui';
import { colors, radius, weight } from '../theme/tokens';

export type UploadState = [boolean, boolean];

const SLOTS = [
  { key: 0, label: '정면' },
  { key: 1, label: '측면' },
] as const;

export function UploadSlots({ value, onToggle }: { value: UploadState; onToggle: (i: number) => void }) {
  return (
    <View style={styles.row}>
      {SLOTS.map((slot) => {
        const done = value[slot.key];
        const inner = (
          <>
            <Text style={{ fontSize: 30 }}>{done ? '✓' : '📹'}</Text>
            <Text style={[styles.label, { color: done ? colors.onDark : colors.ink }]}>{slot.label}</Text>
            <Text style={[styles.state, { color: done ? colors.onDarkSecondary : colors.textWeak }]}>
              {done ? '업로드 완료' : '탭해서 업로드'}
            </Text>
          </>
        );
        return (
          <Press key={slot.key} onPress={() => onToggle(slot.key)} style={styles.slotWrap}>
            {done ? (
              <LinearGradient
                colors={[colors.deepGreen, colors.ink]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={[styles.slot, styles.slotDone]}
              >
                {inner}
              </LinearGradient>
            ) : (
              <View style={[styles.slot, styles.slotIdle]}>{inner}</View>
            )}
          </Press>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 11, marginTop: 18 },
  slotWrap: { flex: 1 },
  slot: { borderRadius: radius.card, paddingVertical: 22, paddingHorizontal: 14, alignItems: 'center' },
  slotIdle: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.borderSoft },
  slotDone: { borderWidth: 1.5, borderColor: colors.ink },
  label: { fontSize: 14, fontWeight: weight.black, marginTop: 8 },
  state: { fontSize: 10.5, marginTop: 3 },
});
