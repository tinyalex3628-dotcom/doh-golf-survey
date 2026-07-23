/**
 * 하단 탭바 — 프라이빗 클럽 감성. 미니멀 라인 아이콘 + 활성 시 샴페인 인디케이터(작은 골드 점).
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, weight } from '../theme/tokens';
import { TabKey } from '../navigation/pages';
import { NavIcon, NavIconName } from './NavIcon';

const TABS: { key: TabKey; label: string; icon: NavIconName }[] = [
  { key: 'home', label: '라운지', icon: 'home' },
  { key: 'analysis', label: '스윙 분석', icon: 'swing' },
  { key: 'dict', label: '골프 사전', icon: 'library' },
  { key: 'profile', label: '멤버', icon: 'member' },
];

export function TabBar({ active, onTab }: { active: TabKey; onTab: (tab: TabKey) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((tab) => {
        const on = tab.key === active;
        return (
          <Pressable key={tab.key} style={styles.item} onPress={() => onTab(tab.key)} hitSlop={6}>
            <NavIcon name={tab.icon} color={on ? colors.ink : colors.textDisabled} size={22} />
            <Text style={[styles.label, { color: on ? colors.ink : colors.textDisabled, fontWeight: on ? weight.bold : weight.medium }]}>
              {tab.label}
            </Text>
            <View style={[styles.dot, on && styles.dotOn]} />
          </Pressable>
        );
      })}
    </View>
  );
}

export const TAB_BAR_HEIGHT = 64;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(245,241,232,.96)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  label: { fontSize: 10, letterSpacing: 0.2 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 1, backgroundColor: 'transparent' },
  dotOn: { backgroundColor: colors.gold },
});
