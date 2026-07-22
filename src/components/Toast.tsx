/**
 * 전역 토스트 (프로토타입의 toastMsg: 하단 pill, 1.7s 후 자동 소멸)
 */
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, weight } from '../theme/tokens';

type ToastContextValue = { showToast: (msg: string) => void };

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    timer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setMsg(''));
    }, 1700);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {msg ? (
        <Animated.View pointerEvents="none" style={[styles.wrap, { opacity }]}>
          <View style={styles.pill}>
            <Text style={styles.text}>{msg}</Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 96,
    alignItems: 'center',
    zIndex: 60,
  },
  pill: {
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
    ...shadow.toast,
  },
  text: { color: colors.sheetBg, fontSize: 12.5, fontWeight: weight.bold },
});
