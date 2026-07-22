import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { DarkCard, Press, PrimaryButton, t as tt } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { CamKey, PRO_NAMES, useComparison } from '../state/comparison';

const CAMS: { key: '정면' | '측면'; icon: string }[] = [
  { key: '정면', icon: '⬆' },
  { key: '측면', icon: '➡' },
];

export default function CameraScreen() {
  const { go } = useNav();
  const { pro, cam, setCam } = useComparison();
  const proName = pro ? PRO_NAMES[pro] : '프로';

  return (
    <Screen>
      <Text style={[tt.screenTitle, { fontSize: 20 }]}>어느 각도로 볼까요?</Text>
      <Text style={tt.subtitle}>{proName} 프로의 영상을 정면 또는 측면으로.</Text>

      <View style={styles.row}>
        {CAMS.map((c) => {
          const on = cam === c.key;
          const inner = (
            <>
              <Text style={{ fontSize: 30 }}>{c.icon}</Text>
              <Text style={[styles.label, { color: on ? colors.onDark : colors.ink }]}>{c.key}</Text>
            </>
          );
          return (
            <Press key={c.key} style={{ flex: 1 }} onPress={() => setCam(c.key as CamKey)}>
              {on ? (
                <DarkCard style={[styles.cell, styles.cellOn]}>{inner}</DarkCard>
              ) : (
                <View style={[styles.cell, styles.cellIdle]}>{inner}</View>
              )}
            </Press>
          );
        })}
      </View>

      <PrimaryButton label="프로 단독 분석으로 이동 ›" enabled={!!cam} onPress={() => go('proSolo')} style={{ marginTop: 18 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 11, marginTop: 18 },
  cell: { borderRadius: radius.card, paddingVertical: 24, paddingHorizontal: 14, alignItems: 'center' },
  cellIdle: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.borderSoft },
  cellOn: { borderWidth: 1.5, borderColor: colors.ink },
  label: { fontSize: 15, fontWeight: weight.black, marginTop: 8 },
});
