/**
 * 미니멀 라인 아이콘 (탭바용). 이모지 대신 SVG 스트로크로 우아하게.
 * react-native-svg 사용 → 웹/네이티브·아티팩트 프리뷰 모두 렌더.
 */
import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type NavIconName = 'home' | 'swing' | 'library' | 'member';

export function NavIcon({ name, color, size = 22 }: { name: NavIconName; color: string; size?: number }) {
  const sw = 1.6;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'home' && (
        <>
          <Path d="M3.5 11 L12 4 L20.5 11" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M5.5 9.5 V20 H18.5 V9.5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M10 20 V14 H14 V20" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {name === 'swing' && (
        // 스윙 분석 = 재생/영상 프레임
        <>
          <Rect x={3.5} y={5} width={17} height={14} rx={3} stroke={color} strokeWidth={sw} />
          <Path d="M10.5 9.2 L15 12 L10.5 14.8 Z" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        </>
      )}
      {name === 'library' && (
        // 골프 사전 = 책
        <>
          <Path
            d="M12 6.5 C10.5 5.3 8.2 5 5.5 5.3 V18 C8.2 17.7 10.5 18 12 19"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 6.5 C13.5 5.3 15.8 5 18.5 5.3 V18 C15.8 17.7 13.5 18 12 19"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {name === 'member' && (
        // 프로필 = 회원
        <>
          <Circle cx={12} cy={9} r={3.4} stroke={color} strokeWidth={sw} />
          <Path d="M5.5 19.5 C5.5 15.8 8.4 13.6 12 13.6 C15.6 13.6 18.5 15.8 18.5 19.5" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}
