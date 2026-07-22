import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { PrimaryButton, t as tt } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';

export default function SubFeedbackScreen() {
  const { go } = useNav();
  return (
    <Screen>
      <Text style={[tt.screenTitle, { fontSize: 20 }]}>피드백 과정 영상</Text>
      <Text style={tt.subtitle}>구독자가 실제로 받는 피드백이 어떻게 진행되는지 영상으로 보여드려요.</Text>

      <View style={styles.video}>
        <View style={styles.playBtn}>
          <Text style={{ fontSize: 18, color: colors.ink }}>▶</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>피드백 예시 영상 (첨부 예정)</Text>
        </View>
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          스윙 등록 → 프로 분석 → 맞춤 피드백 → 숙제 → 재확인. 구독하면 이 과정을 반복하며 스윙이 관리돼요.
        </Text>
      </View>

      <PrimaryButton label="플랜 살펴보기 ›" onPress={() => go('membership')} style={{ marginTop: 14 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  video: { marginTop: 16, aspectRatio: 16 / 9, borderRadius: radius.card, backgroundColor: colors.darkestGreen, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  playBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(247,244,236,.92)', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', bottom: 12, left: 12, paddingHorizontal: 11, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(11,21,16,.7)' },
  badgeText: { color: colors.goldLight, fontSize: 11, fontWeight: weight.black },
  note: { marginTop: 12, backgroundColor: 'rgba(27,38,32,.04)', borderRadius: radius.button, padding: 14 },
  noteText: { fontSize: 12.5, color: 'rgba(27,38,32,.6)', lineHeight: 20 },
});
