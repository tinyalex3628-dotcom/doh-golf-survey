import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Card, DarkCard, Press, SectionLabel } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';

export default function FeedbackScreen() {
  const { go } = useNav();
  return (
    <Screen>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 9, color: 'rgba(27,38,32,.5)' }}>PRO</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>이도형 프로에게 문의</Text>
          <Text style={styles.sub}>궁금한 스윙을 첨부해 물어보세요</Text>
        </View>
      </View>

      <Card style={{ padding: 15, marginTop: 16 }}>
        <SectionLabel>첨부된 스윙</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 9 }}>
          <LinearGradient colors={[colors.highlightGreen, colors.darkestGreen]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.attach} />
          <View style={styles.attachAdd}>
            <Text style={{ color: 'rgba(27,38,32,.35)', fontSize: 22 }}>+</Text>
          </View>
        </View>
        <View style={styles.quote}>
          <Text style={styles.quoteText}>"임팩트에서 골반이 늦게 도는 것 같은데, 어떻게 고칠까요?"</Text>
        </View>
      </Card>

      <DarkCard style={{ padding: 16, marginTop: 14 }}>
        <SectionLabel style={{ color: colors.goldLight, letterSpacing: 1 }}>MEMBERSHIP으로 연결</SectionLabel>
        <Text style={styles.memTitle}>프로 피드백은 관리 플랜에서{'\n'}이어집니다</Text>
        <Text style={styles.memDesc}>강요가 아니라, 궁금증이 생긴 지금이 자연스러운 순간이에요.</Text>
        <Press onPress={() => go('membership')} activeScale={0.99} style={styles.memBtn}>
          <Text style={styles.memBtnText}>관리 플랜 살펴보기 ›</Text>
        </Press>
      </DarkCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingTop: 4 },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(27,38,32,.3)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: weight.black, color: colors.ink, letterSpacing: -0.2 },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  attach: { width: 56, height: 70, borderRadius: 9 },
  attachAdd: { width: 56, height: 70, borderRadius: 9, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(27,38,32,.2)', alignItems: 'center', justifyContent: 'center' },
  quote: { marginTop: 13, backgroundColor: 'rgba(27,38,32,.04)', borderRadius: 11, padding: 12 },
  quoteText: { fontSize: 12.5, color: colors.textSecondary, lineHeight: 19 },
  memTitle: { fontSize: 15, fontWeight: weight.black, color: colors.onDark, marginTop: 6, lineHeight: 21 },
  memDesc: { fontSize: 11.5, color: colors.onDarkSecondary, marginTop: 6, lineHeight: 18 },
  memBtn: { marginTop: 13, paddingVertical: 13, borderRadius: radius.iconTile, backgroundColor: colors.goldLight, alignItems: 'center' },
  memBtnText: { fontSize: 13.5, fontWeight: weight.black, color: colors.darkestGreen },
});
