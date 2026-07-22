/**
 * 하단 탭바 (fixed, blur 느낌 배경). 홈/스윙분석/골프사전/프로필 4탭.
 * 활성 탭은 아이콘이 사각(radius 7) + Ink 색, 라벨 800.
 * 단일 스택 전역에 오버레이되어 어느 화면에서든 동일하게 보인다.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, weight } from '../theme/tokens';
import { TabKey } from '../navigation/pages';

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'home', label: '홈', emoji: '🏠' },
  { key: 'analysis', label: '스윙분석', emoji: '🎬' },
  { key: 'dict', label: '골프사전', emoji: '📖' },
  { key: 'profile', label: '프로필', emoji: '👤' },
];

export function TabBar({ active, onTab }: { active: TabKey; onTab: (tab: TabKey) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const on = tab.key === active;
        return (
          <Pressable key={tab.key} style={styles.item} onPress={() => onTab(tab.key)} hitSlop={6}>
            <View
              style={[
                styles.icon,
                {
                  borderRadius: on ? 7 : 11,
                  backgroundColor: on ? colors.ink : 'rgba(27,38,32,.06)',
                },
              ]}
            >
              <Text style={{ fontSize: 13, opacity: on ? 1 : 0.5 }}>{tab.emoji}</Text>
            </View>
            <Text
              style={[
                styles.label,
                { fontWeight: on ? weight.black : weight.semibold, color: on ? colors.ink : colors.textFaint },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const TAB_BAR_HEIGHT = 62;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(247,244,236,.94)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  icon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 10 },
});
