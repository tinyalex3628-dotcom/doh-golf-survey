import React from 'react';
import { Text } from 'react-native';
import { Screen } from '../components/Screen';
import { PrimaryButton, t as tt } from '../components/ui';
import { PlanCards } from '../components/PlanCards';
import { useNav } from '../navigation/useNav';

export default function MembershipScreen() {
  const { navigation } = useNav();
  return (
    <Screen>
      <Text style={[tt.screenTitle, { fontSize: 20 }]}>어디까지 관리받을까요?</Text>
      <Text style={tt.subtitle}>이도형 프로가 계속 내 골프를 관리해주는 플랜.</Text>
      <PlanCards />
      <PrimaryButton label="홈으로 돌아가기" onPress={() => navigation.navigate('home')} style={{ marginTop: 14 }} />
    </Screen>
  );
}
