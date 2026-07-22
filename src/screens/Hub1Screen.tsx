import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Card, DarkCard, IconTile, Press, SectionLabel, t as tt } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';

// 최근 스윙 (더미) — 실제로는 백엔드/갤러리에서 로드
const RECENT = [
  { side: '정면', day: '오늘', club: '드라이버' },
  { side: '측면', day: '오늘', club: '드라이버' },
  { side: '정면', day: '6/28', club: '아이언' },
];

export default function Hub1Screen() {
  const { go } = useNav();
  return (
    <Screen>
      <View style={{ paddingHorizontal: 2 }}>
        <Text style={tt.screenTitle}>스윙 분석</Text>
        <Text style={tt.subtitle}>AI에게 맡기거나, 내 스윙을 직접 골라 분석해요.</Text>
      </View>

      {/* AI 강조 카드 — 추천 가이드 흐름 */}
      <Press onPress={() => go('aiSurvey')} activeScale={0.99} style={{ marginTop: 16 }}>
        <DarkCard style={{ padding: 20 }}>
          <SectionLabel style={{ color: colors.goldLight, letterSpacing: 1 }}>AI 스윙분석 · 추천</SectionLabel>
          <Text style={styles.emphTitle}>AI 스윙분석 + 설문</Text>
          <Text style={styles.emphDesc}>
            설문 → 스윙 등록 → 추가 질문 → 맞춤 분석까지{'\n'}한 번에. 뭘 볼지 모르겠다면 여기서 시작하세요.
          </Text>
          <Text style={styles.emphCta}>시작하기 ›</Text>
        </DarkCard>
      </Press>

      {/* ── 내 스윙 분석하기 (핵심 · 상단) ── */}
      <Card style={styles.analyzeCard}>
        <Press onPress={() => go('single')} activeScale={0.99} style={styles.analyzeHead}>
          <IconTile emoji="🎬" size={44} bg="rgba(176,122,46,.14)" />
          <View style={{ flex: 1 }}>
            <Text style={styles.analyzeTitle}>내 스윙 분석하기</Text>
            <Text style={styles.analyzeDesc}>프레임·각도·선으로 자세히 · 과거 스윙과 비교까지</Text>
          </View>
          <Text style={{ color: colors.textDisabled, fontSize: 18 }}>›</Text>
        </Press>

        <View style={styles.divider} />

        <View style={styles.recentHead}>
          <Text style={styles.recentLabel}>최근 내 스윙</Text>
          <Press activeScale={0.96} onPress={() => go('gallery')} hitSlop={8}>
            <Text style={styles.seeAll}>전체 12개 ›</Text>
          </Press>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
          {RECENT.map((s, i) => (
            <Press key={i} onPress={() => go('single')} style={styles.thumbWrap}>
              <LinearGradient
                colors={[colors.highlightGreen, colors.darkestGreen]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.thumb}
              >
                <View style={styles.thumbTag}>
                  <Text style={styles.thumbTagText}>{s.side}</Text>
                </View>
                <View style={styles.playDot}>
                  <Text style={{ fontSize: 9, color: colors.ink }}>▶</Text>
                </View>
              </LinearGradient>
              <Text style={styles.thumbClub}>{s.club}</Text>
              <Text style={styles.thumbDay}>{s.day}</Text>
            </Press>
          ))}
        </ScrollView>
      </Card>

      {/* ── 새 스윙 올리기 (중하단) ── */}
      <Press onPress={() => go('upload')} activeScale={0.99} style={{ marginTop: 12 }}>
        <View style={styles.uploadCard}>
          <View style={styles.uploadPlus}>
            <Text style={styles.uploadPlusText}>＋</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.uploadTitle}>새 스윙 올리기</Text>
            <Text style={styles.uploadDesc}>지금 촬영하거나 영상을 업로드해요</Text>
          </View>
          <Text style={{ color: colors.textDisabled, fontSize: 17 }}>›</Text>
        </View>
      </Press>

      {/* 프로와 비교 진입 */}
      <Press onPress={() => go('hub2')} activeScale={0.99} style={{ marginTop: 12 }}>
        <View style={styles.hub2Banner}>
          <IconTile emoji="⚔" size={36} bg="rgba(237,217,163,.16)" fontSize={17} />
          <View style={{ flex: 1 }}>
            <Text style={styles.hub2Title}>프로와 비교하기</Text>
            <Text style={styles.hub2Sub}>프로 스윙과 나란히 놓고 배우기</Text>
          </View>
          <Text style={{ color: colors.goldLight, fontSize: 16 }}>›</Text>
        </View>
      </Press>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emphTitle: { fontSize: 21, fontWeight: weight.black, color: colors.onDark, marginTop: 6, letterSpacing: -0.4 },
  emphDesc: { fontSize: 12, color: colors.onDarkSecondary, marginTop: 5, lineHeight: 19 },
  emphCta: { marginTop: 14, fontSize: 12.5, fontWeight: weight.black, color: colors.goldLight },

  // 내 스윙 분석하기 카드
  analyzeCard: { marginTop: 18, padding: 16, borderRadius: radius.card },
  analyzeHead: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  analyzeTitle: { fontSize: 16.5, fontWeight: weight.black, color: colors.ink },
  analyzeDesc: { fontSize: 11.5, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  recentHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  recentLabel: { fontSize: 11, fontWeight: weight.black, color: colors.textFaint, letterSpacing: 0.4 },
  seeAll: { fontSize: 11.5, fontWeight: weight.black, color: colors.accentGreen },
  strip: { gap: 10, paddingRight: 4 },
  thumbWrap: { width: 88 },
  thumb: { width: 88, aspectRatio: 3 / 4, borderRadius: radius.chip, overflow: 'hidden' },
  thumbTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(11,21,16,.72)',
  },
  thumbTagText: { color: colors.goldLight, fontSize: 9, fontWeight: weight.black },
  playDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(247,244,236,.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbClub: { fontSize: 11.5, fontWeight: weight.black, color: colors.ink, marginTop: 6 },
  thumbDay: { fontSize: 10, color: colors.textWeak, marginTop: 1 },

  // 새 스윙 올리기 카드
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 15,
    borderRadius: radius.card,
    backgroundColor: 'rgba(46,92,68,.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(46,92,68,.2)',
    borderStyle: 'dashed',
  },
  uploadPlus: {
    width: 40,
    height: 40,
    borderRadius: radius.iconTile,
    backgroundColor: 'rgba(46,92,68,.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPlusText: { fontSize: 22, fontWeight: weight.black, color: colors.accentGreen, marginTop: -2 },
  uploadTitle: { fontSize: 14.5, fontWeight: weight.black, color: colors.ink },
  uploadDesc: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },

  hub2Banner: {
    borderRadius: radius.card,
    padding: 15,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  hub2Title: { fontSize: 14, fontWeight: weight.black, color: colors.onDark },
  hub2Sub: { fontSize: 10.5, color: colors.onDarkSecondary, marginTop: 1 },
});
