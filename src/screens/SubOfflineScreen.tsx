import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Card, t as tt } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';

const INFO = [
  { label: '위치', value: '주소가 여기 들어가요 (직접 입력)' },
  { label: '운영 시간 · 예약', value: '일정 및 예약 방법 안내 (직접 입력)' },
];

export default function SubOfflineScreen() {
  return (
    <Screen>
      <Text style={[tt.screenTitle, { fontSize: 20 }]}>오프라인 레슨 정보</Text>
      <Text style={tt.subtitle}>현장 레슨 위치·일정·예약 안내가 들어갈 곳이에요.</Text>

      <LinearGradient colors={[colors.highlightGreen, colors.darkestGreen]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.map}>
        <Text style={styles.mapText}>지도 · 위치 (준비 중)</Text>
        <View style={styles.mapPin}>
          <Text style={styles.mapPinText}>📍 DOH 골프 스튜디오</Text>
        </View>
      </LinearGradient>

      <View style={{ gap: 9, marginTop: 12 }}>
        {INFO.map((i) => (
          <Card key={i.label} style={{ padding: 14, borderColor: 'rgba(27,38,32,.09)' }}>
            <Text style={styles.label}>{i.label}</Text>
            <Text style={styles.value}>{i.value}</Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  map: { marginTop: 16, aspectRatio: 16 / 10, borderRadius: radius.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  mapText: { color: 'rgba(247,244,236,.55)', fontSize: 12, fontWeight: weight.bold },
  mapPin: { position: 'absolute', bottom: 12, left: 12, paddingHorizontal: 11, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(11,21,16,.7)' },
  mapPinText: { color: colors.goldLight, fontSize: 11, fontWeight: weight.black },
  label: { fontSize: 11, fontWeight: weight.black, color: colors.gold, letterSpacing: 0.4 },
  value: { fontSize: 13, color: colors.ink, marginTop: 3 },
});
