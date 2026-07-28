import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Press, SectionLabel, t as tt } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { RootStackParamList } from '../navigation/pages';
import { useSwings } from '../hooks/useSwings';
import { formatDayLabel } from '../utils/dateGroup';
import { Swing } from '../types/swing';

export default function GalleryScreen() {
  const { navigation } = useNav();
  const route = useRoute<RouteProp<RootStackParamList, 'gallery'>>();
  const pickMode = route.params?.mode === 'pickForCompare';
  const { groups, source } = useSwings();

  const onPick = (label: string, item: Swing) => {
    // uri를 함께 넘겨야 다음 화면에서 실제 영상이 재생된다 (샘플 데이터엔 uri가 없어 플레이스홀더)
    if (pickMode) {
      navigation.navigate('multi', { pastSwing: { label, club: item.club, side: item.side, uri: item.uri } });
    } else {
      navigation.navigate('single', { swing: { label, club: item.club, side: item.side, uri: item.uri } });
    }
  };

  return (
    <Screen>
      <Text style={[tt.screenTitle, { fontSize: 20 }]}>{pickMode ? '비교할 과거 스윙 선택' : '내 스윙 갤러리'}</Text>
      <Text style={tt.subtitle}>
        {pickMode ? '고른 스윙이 비교 화면의 과거 쪽에 들어가요.' : '촬영 날짜 기준으로 자동 정리돼요. 탭하면 분석으로.'}
      </Text>

      {pickMode ? (
        <View style={styles.pickBanner}>
          <Text style={styles.pickBannerText}>⚖ 비교용 선택 모드 · 스윙을 하나 고르세요</Text>
        </View>
      ) : source === 'sample' ? (
        <View style={styles.sampleNote}>
          <Text style={styles.sampleNoteText}>
            지금은 샘플이에요. 실제 폰에서는 갤러리 영상의 촬영 날짜로 자동 채워져요.
          </Text>
        </View>
      ) : null}

      <View style={{ gap: 16, marginTop: 16 }}>
        {groups.map((g) => (
          <View key={g.date}>
            <SectionLabel>{g.date}</SectionLabel>
            <View style={styles.grid}>
              {g.items.map((it) => (
                <Press key={it.id} onPress={() => onPick(`${g.short} · ${it.club}`, it)} style={styles.cell}>
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
                      <View style={styles.dateTag}>
                        <Text style={styles.dateTagText}>{formatDayLabel(it.createdAt)}</Text>
                      </View>
                      <View style={styles.playBtn}>
                        <Text style={{ fontSize: 10, color: colors.ink }}>{pickMode ? '＋' : '▶'}</Text>
                      </View>
                    </LinearGradient>
                    <Text style={styles.club}>{it.club}</Text>
                    <Text style={styles.tag}>{it.tag ?? formatDayLabel(it.createdAt)}</Text>
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
  sampleNote: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.button,
    backgroundColor: 'rgba(27,38,32,.04)',
  },
  sampleNoteText: { fontSize: 11.5, color: colors.textSecondary, lineHeight: 16 },
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
  dateTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(11,21,16,.55)',
  },
  dateTagText: { color: colors.onDark, fontSize: 9, fontWeight: weight.black },
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
