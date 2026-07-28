/**
 * 스윙 영상 분석 무대.
 * uri가 있으면 실제 영상을 재생(expo-video), 없으면 실루엣 플레이스홀더.
 *
 * 재생 위치는 부모가 준 `seekTime`(초)으로만 움직인다. 두 무대를 나란히 놓고
 * 싱크를 맞추려면 부모가 각 무대에 '자기 구간으로 환산한 시각'을 내려주면 된다.
 * (환산 = utils/swingTimeline.ts · 구간은 사용자가 직접 지정)
 */
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors, weight } from '../theme/tokens';

export function SwingStage({
  uri,
  seekTime,
  paused = true,
  showLine,
  angleText,
  badge,
  style,
  onLoad,
  onTimeUpdate,
  children,
}: {
  uri?: string;
  /** 이 영상에서 보여줄 시각(초). 바뀌면 그 지점으로 이동 */
  seekTime?: number;
  paused?: boolean;
  showLine?: boolean;
  angleText?: string;
  badge?: string;
  style?: StyleProp<ViewStyle>;
  /** 영상 길이(초) 파악 시 — 부모가 구간 기본값을 잡는 재료 */
  onLoad?: (info: { duration: number }) => void;
  /** 재생 중 현재 시각(초) */
  onTimeUpdate?: (t: number) => void;
  children?: React.ReactNode;
}) {
  const player = useVideoPlayer(uri ?? null, (p) => {
    p.loop = false;
    p.muted = true;
  });

  const reported = useRef(false);

  // 길이 파악 — 로드가 끝나야 duration이 잡히므로 잠깐 폴링
  useEffect(() => {
    if (!uri || !player) return;
    reported.current = false;
    const id = setInterval(() => {
      const d = player.duration;
      if (!reported.current && typeof d === 'number' && d > 0) {
        reported.current = true;
        onLoad?.({ duration: d });
        clearInterval(id);
      }
    }, 120);
    return () => clearInterval(id);
  }, [uri, player]);

  // 부모가 준 시각으로 이동 (슬라이더 조작)
  useEffect(() => {
    if (!uri || !player || seekTime == null || !Number.isFinite(seekTime)) return;
    if (Math.abs((player.currentTime ?? 0) - seekTime) < 0.03) return;
    try {
      player.currentTime = seekTime;
    } catch {
      /* 로드 전이면 다음 seek에서 반영 */
    }
  }, [seekTime, uri, player]);

  // 재생/정지
  useEffect(() => {
    if (!uri || !player) return;
    if (paused) player.pause();
    else player.play();
  }, [paused, uri, player]);

  // 재생 중 현재 시각 보고 (부모 슬라이더 추종)
  useEffect(() => {
    if (!uri || !player || paused || !onTimeUpdate) return;
    const id = setInterval(() => {
      const t = player.currentTime;
      if (typeof t === 'number') onTimeUpdate(t);
    }, 80);
    return () => clearInterval(id);
  }, [paused, uri, player, onTimeUpdate]);

  return (
    <View style={[styles.stage, style]}>
      {uri ? (
        <VideoView style={StyleSheet.absoluteFill} player={player} nativeControls={false} contentFit="contain" />
      ) : (
        <View style={styles.silhouette} />
      )}

      <Svg style={StyleSheet.absoluteFill as any} viewBox="0 0 100 133" preserveAspectRatio="none" pointerEvents="none">
        <Line x1={14} y1={115} x2={86} y2={115} stroke="rgba(237,217,163,.4)" strokeWidth={0.4} strokeDasharray="2 2" />
        {showLine ? <Line x1={30} y1={115} x2={70} y2={95} stroke={colors.goldLight} strokeWidth={1} /> : null}
      </Svg>

      {showLine && angleText ? (
        <View style={styles.angleBadge} pointerEvents="none">
          <Text style={styles.angleText}>{angleText}</Text>
        </View>
      ) : null}
      {badge ? (
        <View style={styles.topBadge} pointerEvents="none">
          <Text style={styles.topBadgeText}>{badge}</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { borderRadius: 16, overflow: 'hidden', backgroundColor: colors.darkestGreen, aspectRatio: 3 / 4 },
  silhouette: {
    position: 'absolute',
    left: '33%',
    top: '15%',
    width: '34%',
    height: '74%',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    backgroundColor: 'rgba(247,244,236,.1)',
    borderWidth: 1,
    borderColor: 'rgba(247,244,236,.3)',
    borderStyle: 'dashed',
  },
  angleBadge: {
    position: 'absolute',
    top: '50%',
    left: '56%',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    backgroundColor: 'rgba(11,21,16,.85)',
  },
  angleText: { color: colors.goldLight, fontSize: 11, fontWeight: weight.black },
  topBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: 'rgba(11,21,16,.7)',
  },
  topBadgeText: { color: colors.goldLight, fontSize: 10.5, fontWeight: weight.black },
});
