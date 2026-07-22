/**
 * 바텀시트 오버레이 (프로토타입의 sheetUp + fadeBg).
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/tokens';

export function BottomSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 260 }),
      ]).start();
    } else {
      translateY.setValue(Dimensions.get('window').height);
      fade.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
          <Pressable style={styles.backdrop} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[styles.sheet, { paddingBottom: 26 + insets.bottom, transform: [{ translateY }] }]}>
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: 'rgba(11,21,16,.45)' },
  sheet: {
    backgroundColor: colors.sheetBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  handle: { width: 40, height: 4, borderRadius: 100, backgroundColor: 'rgba(27,38,32,.15)', alignSelf: 'center', marginBottom: 16 },
});
