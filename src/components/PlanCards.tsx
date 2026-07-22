import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DarkCard } from './ui';
import { colors, radius, weight } from '../theme/tokens';
import { PLANS } from '../data/plans';

export function PlanCards() {
  return (
    <View style={{ gap: 10, marginTop: 16 }}>
      {PLANS.map((p) => {
        const inner = (
          <>
            <View style={styles.head}>
              <Text style={[styles.name, { color: p.on ? colors.onDark : colors.ink }]}>{p.name}</Text>
              <Text style={[styles.price, { color: p.on ? colors.goldLight : colors.accentGreen }]}>{p.price}</Text>
            </View>
            <Text style={[styles.desc, { color: p.on ? 'rgba(247,244,236,.65)' : colors.textSecondary }]}>{p.desc}</Text>
          </>
        );
        return p.on ? (
          <DarkCard key={p.name} style={styles.card}>{inner}</DarkCard>
        ) : (
          <View key={p.name} style={[styles.card, styles.idle]}>{inner}</View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, padding: 16 },
  idle: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.borderSoft },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  name: { fontSize: 15, fontWeight: weight.black },
  price: { fontSize: 13, fontWeight: weight.black },
  desc: { fontSize: 11.5, marginTop: 4, lineHeight: 18 },
});
