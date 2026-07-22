import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { PrimaryButton, t as tt } from '../components/ui';
import { UploadSlots, UploadState } from '../components/UploadSlots';
import { colors, radius } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';

export default function UploadScreen() {
  const { go } = useNav();
  const { showToast } = useToast();
  const [up, setUp] = useState<UploadState>([false, false]);
  const anyUp = up[0] || up[1];

  const toggle = (i: number) => setUp((prev) => (i === 0 ? [!prev[0], prev[1]] : [prev[0], !prev[1]]));

  return (
    <Screen>
      <Text style={[tt.screenTitle, { fontSize: 20 }]}>오늘 스윙을 올려볼까요?</Text>
      <Text style={tt.subtitle}>정면과 측면, 두 각도를 올리면 더 정확해요.</Text>

      <UploadSlots value={up} onToggle={toggle} />

      <PrimaryButton
        label="단독 분석으로 이동 ›"
        enabled={anyUp}
        onPress={() => {
          showToast('스윙을 등록했어요');
          go('single');
        }}
        style={{ marginTop: 16 }}
      />

      <View style={styles.hint}>
        <Text style={styles.hintText}>
          두 슬롯을 탭해 업로드 상태를 토글해 보세요. 업로드가 완료되면 단독 분석 페이지로 넘어갑니다.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { marginTop: 12, padding: 14, backgroundColor: 'rgba(27,38,32,.04)', borderRadius: radius.button },
  hintText: { fontSize: 11.5, lineHeight: 19, color: 'rgba(27,38,32,.6)' },
});
