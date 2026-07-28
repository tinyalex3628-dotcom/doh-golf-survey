import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { PrimaryButton, t as tt } from '../components/ui';
import { UploadSlots, UploadState } from '../components/UploadSlots';
import { colors, radius } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';
import { pickSwingFromGallery } from '../services/swingLibrary';
import { Swing } from '../types/swing';

export default function UploadScreen() {
  const { navigation } = useNav();
  const { showToast } = useToast();
  // 슬롯별로 실제로 고른 영상을 들고 있는다 (없으면 미업로드)
  const [picked, setPicked] = useState<[Swing | null, Swing | null]>([null, null]);
  const up: UploadState = [!!picked[0], !!picked[1]];
  const anyUp = up[0] || up[1];

  const onSlot = async (i: number) => {
    // 이미 고른 슬롯을 다시 누르면 해제
    if (picked[i]) {
      setPicked((prev) => (i === 0 ? [null, prev[1]] : [prev[0], null]));
      return;
    }
    const swing = await pickSwingFromGallery();
    if (!swing) {
      // 웹 미리보기·권한 거부 — 영상 없이도 흐름은 이어지도록 자리표시자를 넣는다
      const stub: Swing = {
        id: `stub-${i}-${Date.now()}`,
        createdAt: Date.now(),
        side: i === 0 ? '정면' : '측면',
        club: '스윙',
      };
      setPicked((prev) => (i === 0 ? [stub, prev[1]] : [prev[0], stub]));
      showToast('영상을 못 불러와 자리표시자로 넣었어요');
      return;
    }
    const withSide: Swing = { ...swing, side: i === 0 ? '정면' : '측면' };
    setPicked((prev) => (i === 0 ? [withSide, prev[1]] : [prev[0], withSide]));
    showToast(`${withSide.side} 영상을 등록했어요`);
  };

  const goAnalyze = () => {
    const chosen = picked[0] ?? picked[1];
    if (!chosen) return;
    showToast('스윙을 등록했어요');
    navigation.navigate('single', {
      swing: {
        label: '방금 올린 스윙',
        club: chosen.club,
        side: chosen.side,
        uri: chosen.uri,
      },
    });
  };

  return (
    <Screen>
      <Text style={[tt.screenTitle, { fontSize: 20 }]}>오늘 스윙을 올려볼까요?</Text>
      <Text style={tt.subtitle}>정면과 측면, 두 각도를 올리면 더 정확해요.</Text>

      <UploadSlots value={up} onToggle={onSlot} />

      <PrimaryButton label="단독 분석으로 이동 ›" enabled={anyUp} onPress={goAnalyze} style={{ marginTop: 16 }} />

      <View style={styles.hint}>
        <Text style={styles.hintText}>
          슬롯을 탭하면 갤러리에서 영상을 고릅니다. 다시 탭하면 선택이 해제돼요. 분석 화면에서 스윙 시작·끝 구간을
          직접 정할 수 있습니다.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { marginTop: 16, padding: 13, borderRadius: radius.chip, backgroundColor: colors.surface },
  hintText: { fontSize: 11.5, color: colors.textSecondary, lineHeight: 17 },
});
