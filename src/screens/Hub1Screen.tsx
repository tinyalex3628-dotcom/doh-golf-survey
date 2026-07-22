import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { DarkCard, IconTile, Press, SectionLabel, t as tt } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { RouteName } from '../navigation/pages';

// 최근 스윙 (더미) — 실제로는 백엔드/갤러리에서 로드
const RECENT = [
  { side: '정면', day: '오늘', club: '드라이버' },
  { side: '측면', day: '오늘', club: '드라이버' },
  { side: '정면', day: '6/28', club: '아이언' },
];

// 스윙으로 하는 분석 액션
const TOOLS: { icon: string; iconBg: string; name: string; desc: string; route: RouteName }[] = [
  { icon: '🎬', iconBg: 'rgba(176,122,46,.14)', name: '단독 분석', desc: '한 스윙을 프레임·각도·선으로 자세히', route: 'single' },
  { icon: '⚖', iconBg: 'rgba(176,122,46,.14)', name: '멀티스크린 비교', desc: '과거↔현재 스윙을 나란히 놓고 비교', route: 'multi' },
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

      {/* ── 내 스윙 (가져오기: 촬영/갤러리 통합) ── */}
      <View style={[styles.sectionHead, { marginTop: 22 }]}>
        <SectionLabel>내 스윙</SectionLabel>
        <Press activeScale={0.96} onPress={() => go('gallery')} hitSlop={8}>
          <Text style={styles.seeAll}>전체 12개 ›</Text>
        </Press>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
        style={{ marginHorizontal: -2 }}
      >
        {/* 새 스윙 올리기 — 촬영/업로드 진입 */}
        <Press onPress={() => go('upload')} style={styles.addTile}>
          <View style={styles.addInner}>
            <Text style={styles.addPlus}>＋</Text>
            <Text style={styles.addLabel}>새 스윙</Text>
            <Text style={styles.addSub}>촬영·업로드</Text>
          </View>
        </Press>

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

      {/* ── 분석 도구 (분석하기: 단독/멀티) ── */}
      <SectionLabel style={{ marginTop: 20 }}>분석 도구</SectionLabel>
      <Text style={styles.toolHint}>올리거나 고른 스윙으로 자세히 보고, 비교해요.</Text>
      <View style={styles.toolGroup}>
        {TOOLS.map((tool, i) => (
          <Press key={tool.route} onPress={() => go(tool.route)} activeScale={0.99}>
            <View style={[styles.toolRow, i > 0 && styles.toolDivider]}>
              <IconTile emoji={tool.icon} size={40} bg={tool.iconBg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolDesc}>{tool.desc}</Text>
              </View>
              <Text style={{ color: colors.textDisabled, fontSize: 17 }}>›</Text>
            </View>
          </Press>
        ))}
      </View>

      {/* 프로와 비교 진입 */}
      <Press onPress={() => go('hub2')} activeScale={0.99} style={{ marginTop: 14 }}>
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

  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  seeAll: { fontSize: 11.5, fontWeight: weight.black, color: colors.accentGreen },

  strip: { gap: 10, paddingHorizontal: 2, paddingVertical: 1 },
  // 새 스윙 추가 타일
  addTile: { width: 92 },
  addInner: {
    width: 92,
    aspectRatio: 3 / 4,
    borderRadius: radius.chip,
    borderWidth: 1.5,
    borderColor: 'rgba(27,38,32,.22)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(46,92,68,.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlus: { fontSize: 26, color: colors.accentGreen, fontWeight: weight.black, marginBottom: 2 },
  addLabel: { fontSize: 12.5, fontWeight: weight.black, color: colors.ink },
  addSub: { fontSize: 9.5, color: colors.textWeak, marginTop: 2 },
  // 썸네일
  thumbWrap: { width: 92 },
  thumb: { width: 92, aspectRatio: 3 / 4, borderRadius: radius.chip, overflow: 'hidden' },
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

  toolHint: { fontSize: 11.5, color: colors.textSecondary, marginTop: 4, marginBottom: 10, lineHeight: 16 },
  toolGroup: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15 },
  toolDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  toolName: { fontSize: 14.5, fontWeight: weight.black, color: colors.ink },
  toolDesc: { fontSize: 11, color: colors.textSecondary, marginTop: 2, lineHeight: 15 },

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
