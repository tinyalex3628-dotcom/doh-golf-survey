import React from 'react';
import { Text } from 'react-native';
import { Screen } from '../components/Screen';
import { PrimaryButton, t as tt } from '../components/ui';
import { PlanCards } from '../components/PlanCards';
import { useNav } from '../navigation/useNav';

export default function SubBenefitsScreen() {
  const { go } = useNav();
  return (
    <Screen>
      <Text style={[tt.screenTitle, { fontSize: 20 }]}>구독별 혜택 안내</Text>
      <Text style={tt.subtitle}>플랜별 혜택을 비교해보세요. (상세 내용은 추후 업데이트)</Text>
      <PlanCards />
      <PrimaryButton label="플랜 가입하기" onPress={() => go('membership')} style={{ marginTop: 14 }} />
    </Screen>
  );
}
