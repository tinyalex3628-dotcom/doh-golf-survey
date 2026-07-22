import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Press, SectionLabel, t as tt } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { RootStackParamList } from '../navigation/pages';

const GROUPS = [
  {
    date: '7월 · 이번 주',
    short: '이번 주',
    items: [
      { side: '정면', club: '드라이버', tag: '골반 회전' },
      { side: '측면', club: '드라이버', tag: '템포 좋음' },
    ],
  },
  {
    date: '6월',
    short: '6월',
    items: [
      { side: '정면', club: '아이언', tag: '숙제 완료' },
      { side: '측면', club: '드라이버', tag: '피니시' },
    ],
  },
];

export default function GalleryScreen() {
  const { navigation } = useNav();
  const route = useRoute<RouteProp<RootStackParamList, 'gallery'>>();
  const pickMode = route.params?.mode === 'pickForCompare';

  const onPick = (label: string, item: { side: string; club: string }) => {
    if (pickMode) {
      // 비교 화면으로 돌아가며 선택한 과거 스윙을 전달
      navigation.navigate('multi', { pastSwing: { label, club: item.club, side: item.side } });
    } else {
      navigation.navigate('single');
    }
  };

  return (
    <Screen>
      <Text style={[tt.screenTitle, { fontSize: 20 }]}>{pickMode ? '비교할 과거 스윙 선택' : '내 스윙 갤러리'}</Text>
      <Text style={tt.subtitle}>
        {pickMode ? '고른 스윙이 비교 화면의 과거 쪽에 들어가요.' : '과거 스윙을 날짜별로 모아뒀어요. 탭하면 분석으로.'}
      </Text>

      {pickMode ? (
        <View style={styles.pickBanner}>
          <Text style={styles.pickBannerText}>⚖ 비교용 선택 모드 · 스윙을 하나 고르세요</Text>
        </View>
      ) : null}

      <View style={{ gap: 16, marginTop: 16 }}>
        {GROUPS.map((g) => (
          <View key={g.date}>
            <SectionLabel>{g.date}</SectionLabel>
            <View style={styles.grid}>
              {g.items.map((it, idx) => (
                <Press key={idx} onPress={() => onPick(`${g.short} · ${it.club}`, it)} style={styles.cell}>
                  <View style={styles.thumbCard}>
                    <LinearGradient
                      colors={[colors.highlightGreen, colors.darkestGreen]}
                      start={{ x: 0.1, y: 0 }}
                      end={{ x: 0.9, y: 1 }}
                      style={styles.thumb}
                    >
                      <View style={styles.sideTag}>
                        <Text style={styles.sideTagText}>{it.side}</Text>
                      </View>
                      <View style={styles.playBtn}>
                        <Text style={{ fontSize: 10, color: colors.ink }}>{pickMode ? '＋' : '▶'}</Text>
                      </View>
                    </LinearGradient>
                    <Text style={styles.club}>{it.club}</Text>
                    <Text style={styles.tag}>{it.tag}</Text>
                  </View>
                </Press>
              ))}
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pickBanner: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.button,
    backgroundColor: 'rgba(176,122,46,.1)',
    borderWidth: 1,
    borderColor: 'rgba(176,122,46,.3)',
  },
  pickBannerText: { fontSize: 12, fontWeight: weight.black, color: colors.gold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 8 },
  cell: { width: '48.5%' },
  thumbCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(27,38,32,.09)', borderRadius: radius.button, padding: 8 },
  thumb: { aspectRatio: 4 / 5, borderRadius: 9, overflow: 'hidden' },
  sideTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(11,21,16,.72)',
  },
  sideTagText: { color: colors.goldLight, fontSize: 9, fontWeight: weight.black },
  playBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(247,244,236,.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  club: { fontSize: 11, fontWeight: weight.black, color: colors.ink, marginTop: 6 },
  tag: { fontSize: 10, color: colors.textWeak, marginTop: 1 },
});
