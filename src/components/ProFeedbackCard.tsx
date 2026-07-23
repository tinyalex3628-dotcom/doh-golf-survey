/**
 * 프로 피드백 카드 — 회원 등급(플랜)에 따라 3가지 형식으로 제공.
 *  1) photo      : 사진 + 글 (Basic)
 *  2) annotated  : 회원 스윙에 선 그리기 + 음성 설명 영상 (Coaching)
 *  3) custom     : 회원 맞춤 2~3분 영상 (Elite)
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DarkCard, Press } from './ui';
import { SwingStage } from './SwingStage';
import { colors, radius, weight } from '../theme/tokens';

export type FeedbackTier = 'Basic' | 'Coaching' | 'Elite';

export type ProFeedback =
  | { type: 'photo'; tier: FeedbackTier; pro: string; date: string; body: string; photos: number }
  | { type: 'annotated'; tier: FeedbackTier; pro: string; date: string; body: string; duration: string }
  | { type: 'custom'; tier: FeedbackTier; pro: string; date: string; title: string; body: string; duration: string };

const TIER_EMOJI: Record<FeedbackTier, string> = { Basic: '📷', Coaching: '🎥', Elite: '🎬' };

export function ProFeedbackCard({ feedback, onPlay }: { feedback: ProFeedback; onPlay?: () => void }) {
  return (
    <DarkCard style={styles.card}>
      {/* 헤더: 프로 + 날짜 + 등급 배지 */}
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>PRO</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pro}>{feedback.pro} 프로 피드백</Text>
          <Text style={styles.date}>{feedback.date} · 이번 주 레슨</Text>
        </View>
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>
            {TIER_EMOJI[feedback.tier]} {feedback.tier}
          </Text>
        </View>
      </View>

      {feedback.type === 'photo' && <PhotoBody f={feedback} />}
      {feedback.type === 'annotated' && <AnnotatedBody f={feedback} onPlay={onPlay} />}
      {feedback.type === 'custom' && <CustomBody f={feedback} onPlay={onPlay} />}
    </DarkCard>
  );
}

/** 1) 사진 + 글 */
function PhotoBody({ f }: { f: Extract<ProFeedback, { type: 'photo' }> }) {
  return (
    <>
      <Text style={styles.body}>{f.body}</Text>
      <View style={styles.photoRow}>
        {Array.from({ length: f.photos }).map((_, i) => (
          <LinearGradient
            key={i}
            colors={[colors.highlightGreen, colors.darkestGreen]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.photo}
          >
            <Text style={{ fontSize: 20 }}>🖼</Text>
          </LinearGradient>
        ))}
      </View>
      <Text style={styles.formatNote}>📷 사진과 글로 남긴 피드백이에요.</Text>
    </>
  );
}

/** 2) 선 그리기 + 음성 설명 영상 */
function AnnotatedBody({ f, onPlay }: { f: Extract<ProFeedback, { type: 'annotated' }>; onPlay?: () => void }) {
  return (
    <>
      <Press activeScale={0.98} onPress={onPlay} style={styles.videoWrap}>
        <SwingStage showLine angleText="32°" style={styles.annotatedStage}>
          <View style={styles.playCenter}>
            <View style={styles.playBig}>
              <Text style={{ fontSize: 20, color: colors.ink }}>▶</Text>
            </View>
          </View>
          <View style={styles.voiceBadge}>
            <Text style={styles.voiceText}>🎙 음성 설명 · {f.duration}</Text>
          </View>
        </SwingStage>
      </Press>
      <Text style={styles.body}>{f.body}</Text>
      <Text style={styles.formatNote}>🎥 내 스윙 위에 선을 그리고 음성으로 짚어준 피드백이에요.</Text>
    </>
  );
}

/** 3) 맞춤 2~3분 영상 */
function CustomBody({ f, onPlay }: { f: Extract<ProFeedback, { type: 'custom' }>; onPlay?: () => void }) {
  return (
    <>
      <Press activeScale={0.98} onPress={onPlay} style={styles.videoWrap}>
        <LinearGradient
          colors={[colors.highlightGreen, colors.darkestGreen]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.customThumb}
        >
          <View style={styles.customTag}>
            <Text style={styles.customTagText}>회원님 맞춤 영상</Text>
          </View>
          <View style={styles.playBig}>
            <Text style={{ fontSize: 20, color: colors.ink }}>▶</Text>
          </View>
          <View style={styles.durBadge}>
            <Text style={styles.durText}>{f.duration}</Text>
          </View>
        </LinearGradient>
      </Press>
      <Text style={styles.customTitle}>{f.title}</Text>
      <Text style={styles.body}>{f.body}</Text>
      <Text style={styles.formatNote}>🎬 회원님만을 위해 촬영한 맞춤 영상 피드백이에요.</Text>
    </>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 16, padding: 20 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(237,217,163,.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 9, fontWeight: weight.black, color: colors.goldLight },
  pro: { fontSize: 15, fontWeight: weight.black, color: colors.onDark },
  date: { fontSize: 11, color: colors.onDarkSecondary, marginTop: 2 },
  tierBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: 'rgba(237,217,163,.16)' },
  tierText: { fontSize: 10.5, fontWeight: weight.black, color: colors.goldLight },

  body: { fontSize: 15, lineHeight: 24, color: colors.onDark, marginTop: 16, fontWeight: weight.bold },
  formatNote: { fontSize: 11.5, color: colors.onDarkSecondary, marginTop: 14, lineHeight: 16 },

  // 사진
  photoRow: { flexDirection: 'row', gap: 9, marginTop: 14 },
  photo: { flex: 1, aspectRatio: 4 / 3, borderRadius: radius.chip, alignItems: 'center', justifyContent: 'center' },

  // 영상 공통
  videoWrap: { marginTop: 16 },
  annotatedStage: { aspectRatio: 16 / 10 },
  playCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  playBig: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247,244,236,.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(11,21,16,.72)',
  },
  voiceText: { color: colors.goldLight, fontSize: 11, fontWeight: weight.black },

  // 맞춤 영상
  customThumb: { aspectRatio: 16 / 9, borderRadius: radius.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  customTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(237,217,163,.9)',
  },
  customTagText: { color: colors.darkestGreen, fontSize: 10, fontWeight: weight.black },
  durBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(11,21,16,.72)',
  },
  durText: { color: colors.onDark, fontSize: 11, fontWeight: weight.black },
  customTitle: { fontSize: 15.5, fontWeight: weight.black, color: colors.onDark, marginTop: 14 },
});
