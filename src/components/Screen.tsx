/**
 * 화면 공통 레이아웃: 상단바 + 스크롤 본문.
 * 하단 탭바는 App 레벨에서 전역 오버레이되므로 본문 하단에 탭바 공간(92px)만 확보한다.
 */
import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing } from '../theme/tokens';
import { PAGES, RouteName } from '../navigation/pages';
import { TopBar } from './TopBar';

export function Screen({
  children,
  scroll = true,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const name = route.name as RouteName;
  const meta = PAGES[name];
  const isHome = name === 'home';

  const body = (
    <>
      <TopBar
        title={isHome ? undefined : meta?.name}
        showBrand={false}
        showBack={!isHome && navigation.canGoBack()}
        onBack={() => navigation.goBack()}
      />
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.content, contentStyle]}>{children}</View>
      )}
    </>
  );

  return <View style={styles.root}>{body}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.screenH,
    paddingTop: spacing.sm,
    paddingBottom: spacing.tabBarClearance,
  },
});
