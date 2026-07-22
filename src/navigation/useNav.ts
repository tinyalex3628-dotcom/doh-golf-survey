import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, RouteName } from './pages';

export type Nav = NativeStackNavigationProp<RootStackParamList>;

/** 타입이 지정된 navigation + go(route) 헬퍼 */
export function useNav() {
  const navigation = useNavigation<Nav>();
  const go = (route: RouteName) => navigation.navigate(route);
  return { navigation, go };
}
