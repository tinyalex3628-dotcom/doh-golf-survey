import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { DarkCard, Press, PrimaryButton, t as tt } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { ProKey, useComparison } from '../state/comparison';

const PROS: { key: 'm' | 'f'; name: string; tag: string }[] = [
  { key: 'm', name: '이도형', tag: '남성 프로 · 대표' },
  { key: 'f', name: '김지원', tag: '여성 프로' },
];

export default function ProSelectScreen() {
  const { go } = useNav();
  const { pro, setPro } = useComparison();

  return (
    <Screen>
      <Text style={[tt.screenTitle, { fontSize: 20 }]}>누구의 스윙을 배워볼까요?</Text>
      <Text style={tt.subtitle}>프로를 선택하면 카메라 각도를 고르게 돼요.</Text>

      <View style={{ gap: 11, marginTop: 18 }}>
        {PROS.map((p) => {
          const on = pro === p.key;
          const inner = (
            <>
              <View style={[styles.avatar, { borderColor: on ? colors.goldLight : 'rgba(27,38,32,.3)' }]}>
                <Text style={{ fontSize: 9, color: on ? colors.goldLight : 'rgba(27,38,32,.3)' }}>PRO</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: on ? colors.onDark : colors.ink }]}>{p.name}</Text>
                <Text style={[styles.tag, { color: on ? colors.onDarkSecondary : colors.textWeak }]}>{p.tag}</Text>
              </View>
              <View style={[styles.check, on ? styles.checkOn : styles.checkOff]}>
                {on ? <Text style={{ color: colors.bezelBlack, fontWeight: weight.black, fontSize: 13 }}>✓</Text> : null}
              </View>
            </>
          );
          return (
            <Press key={p.key} activeScale={0.99} onPress={() => setPro(p.key as ProKey)}>
              {on ? (
                <DarkCard style={[styles.card, styles.cardOn]}>{inner}</DarkCard>
              ) : (
                <View style={[styles.card, styles.cardIdle]}>{inner}</View>
              )}
            </Press>
          );
        })}
      </View>

      <PrimaryButton
        label="카메라 선택으로 이동 ›"
        enabled={!!pro}
        onPress={() => go('camera')}
        style={{ marginTop: 18 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: radius.card },
  cardIdle: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.borderSoft },
  cardOn: { borderWidth: 1.5, borderColor: colors.ink },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: weight.black },
  tag: { fontSize: 11.5, marginTop: 1 },
  check: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.goldLight },
  checkOff: { borderWidth: 1.5, borderColor: 'rgba(27,38,32,.2)' },
});
