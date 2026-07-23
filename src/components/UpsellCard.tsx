/**
 * 은근한 업그레이드 유도 카드. 노골적이지 않게, 상위 플랜의 가치를 한 줄로.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Press } from './ui';
import { colors, radius, weight } from '../theme/tokens';

export function UpsellCard({
  eyebrow = '＋ 한 단계 더',
  title,
  body,
  cta,
  onPress,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  cta: string;
  onPress?: () => void;
}) {
  return (
    <Press onPress={onPress} activeScale={0.99}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <Text style={styles.cta}>{cta}</Text>
      </View>
    </Press>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    padding: 16,
    backgroundColor: 'rgba(176,122,46,.06)',
    borderWidth: 1,
    borderColor: 'rgba(176,122,46,.22)',
  },
  eyebrow: { fontSize: 10.5, fontWeight: weight.black, color: colors.gold, letterSpacing: 0.5 },
  title: { fontSize: 15, fontWeight: weight.black, color: colors.ink, marginTop: 6 },
  body: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  cta: { fontSize: 12.5, fontWeight: weight.black, color: colors.gold, marginTop: 10 },
});
