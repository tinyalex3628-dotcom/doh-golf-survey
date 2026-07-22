import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Press, SectionLabel, t as tt } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';

const GROUPS = [
  {
    date: '7월 · 이번 주',
    items: [
      { side: '정면', club: '드라이버', tag: '골반 회전' },
      { side: '측면', club: '드라이버', tag: '템포 좋음' },
    ],
  },
  {
    date: '6월',
    items: [
      { side: '정면', club: '아이언', tag: '숙제 완료' },
      { side: '측면', club: '드라이버', tag: '피니시' },
    ],
  },
];

export default function GalleryScreen() {
  const { go } = useNav();
  return (
    <Screen>
      <Text style={[tt.screenTitle, { fontSize: 20 }]}>내 스윙 갤러리</Text>
      <Text style={tt.subtitle}>과거 스윙을 날짜별로 모아뒀어요. 탭하면 단독 분석으로.</Text>

      <View style={{ gap: 16, marginTop: 16 }}>
        {GROUPS.map((g) => (
          <View key={g.date}>
            <SectionLabel>{g.date}</SectionLabel>
            <View style={styles.grid}>
              {g.items.map((it, idx) => (
                <Press key={idx} onPress={() => go('single')} style={styles.cell}>
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
                        <Text style={{ fontSize: 10, color: colors.ink }}>▶</Text>
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
