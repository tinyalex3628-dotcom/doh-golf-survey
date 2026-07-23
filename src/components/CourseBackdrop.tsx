/**
 * 코스 컨투어(등고선) 배경 — 아주 옅게. 골프 코스 지도/페어웨이 곡선 감성.
 * 크레스트/헤더 뒤에 풀블리드로 깔린다. pointerEvents none.
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';

export function CourseBackdrop({ height = 230 }: { height?: number }) {
  const stroke = 'rgba(24,77,58,0.07)';
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: -18, right: -18, height }}>
      <Svg width="100%" height={height} viewBox="0 0 400 230" preserveAspectRatio="xMidYMid slice">
        <Path d="M-20 60 C 90 20, 170 90, 260 55 S 430 30, 440 70" stroke={stroke} strokeWidth={1.2} fill="none" />
        <Path d="M-20 95 C 100 55, 180 125, 270 90 S 430 65, 440 105" stroke={stroke} strokeWidth={1.2} fill="none" />
        <Path d="M-20 135 C 110 95, 190 165, 280 130 S 430 105, 440 145" stroke={stroke} strokeWidth={1.2} fill="none" />
        <Path d="M-20 178 C 120 138, 200 205, 300 170 S 430 150, 440 188" stroke={stroke} strokeWidth={1.2} fill="none" />
      </Svg>
    </View>
  );
}
