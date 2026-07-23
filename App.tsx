import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from './src/theme/tokens';
import { PAGES, RootStackParamList, RouteName, TAB_ROOT, TabKey } from './src/navigation/pages';
import { TabBar } from './src/components/TabBar';
import { ToastProvider } from './src/components/Toast';
import { ComparisonProvider } from './src/state/comparison';
import { SubscriptionProvider } from './src/state/subscription';

import HomeScreen from './src/screens/HomeScreen';
import HomeworkScreen from './src/screens/HomeworkScreen';
import Hub1Screen from './src/screens/Hub1Screen';
import AiSurveyScreen from './src/screens/AiSurveyScreen';
import UploadScreen from './src/screens/UploadScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import SingleScreen from './src/screens/SingleScreen';
import MultiScreen from './src/screens/MultiScreen';
import Hub2Screen from './src/screens/Hub2Screen';
import ProSelectScreen from './src/screens/ProSelectScreen';
import CameraScreen from './src/screens/CameraScreen';
import ProSoloScreen from './src/screens/ProSoloScreen';
import ProCompareScreen from './src/screens/ProCompareScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import DictScreen from './src/screens/DictScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import SubBenefitsScreen from './src/screens/SubBenefitsScreen';
import SubOfflineScreen from './src/screens/SubOfflineScreen';
import SubProScreen from './src/screens/SubProScreen';
import SubFeedbackScreen from './src/screens/SubFeedbackScreen';
import MembershipScreen from './src/screens/MembershipScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
export const navRef = createNavigationContainerRef<RootStackParamList>();

const SCREENS: Record<RouteName, React.ComponentType<any>> = {
  home: HomeScreen,
  homework: HomeworkScreen,
  hub1: Hub1Screen,
  aiSurvey: AiSurveyScreen,
  upload: UploadScreen,
  gallery: GalleryScreen,
  single: SingleScreen,
  multi: MultiScreen,
  hub2: Hub2Screen,
  proSelect: ProSelectScreen,
  camera: CameraScreen,
  proSolo: ProSoloScreen,
  proCompare: ProCompareScreen,
  feedback: FeedbackScreen,
  dict: DictScreen,
  profile: ProfileScreen,
  subscription: SubscriptionScreen,
  subBenefits: SubBenefitsScreen,
  subOffline: SubOfflineScreen,
  subPro: SubProScreen,
  subFeedback: SubFeedbackScreen,
  membership: MembershipScreen,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const onStateChange = useCallback(() => {
    const current = navRef.getCurrentRoute()?.name as RouteName | undefined;
    if (current && PAGES[current]) {
      setActiveTab(PAGES[current].tab);
    }
  }, []);

  const onTab = useCallback((tab: TabKey) => {
    if (!navRef.isReady()) return;
    navRef.navigate(TAB_ROOT[tab]);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SubscriptionProvider>
       <ComparisonProvider>
        <ToastProvider>
          <NavigationContainer ref={navRef} onReady={onStateChange} onStateChange={onStateChange}>
            <View style={styles.root}>
              <Stack.Navigator
                initialRouteName="home"
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: colors.screenBg },
                }}
              >
                {(Object.keys(SCREENS) as RouteName[]).map((name) => (
                  <Stack.Screen key={name} name={name} component={SCREENS[name]} />
                ))}
              </Stack.Navigator>
              <TabBar active={activeTab} onTab={onTab} />
            </View>
          </NavigationContainer>
        </ToastProvider>
       </ComparisonProvider>
      </SubscriptionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
});
