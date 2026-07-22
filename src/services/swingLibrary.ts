/**
 * 폰 갤러리(미디어 라이브러리)에서 스윙 영상을 촬영 날짜와 함께 읽어온다.
 * - 웹/권한 거부/미지원 환경에서는 null을 반환해 호출부가 샘플 데이터로 대체하도록 한다.
 * - creationTime(ms)이 곧 "촬영/저장된 날짜"이며, 이 값으로 앱이 날짜를 인지한다.
 */
import { Platform } from 'react-native';
import { Swing } from '../types/swing';

export type LibraryResult =
  | { ok: true; swings: Swing[] }
  | { ok: false; reason: 'web' | 'denied' | 'unsupported' | 'error' };

/** 갤러리에서 최근 동영상들을 촬영일과 함께 로드 */
export async function loadSwingsFromLibrary(limit = 60): Promise<LibraryResult> {
  if (Platform.OS === 'web') return { ok: false, reason: 'web' };
  try {
    // 웹 번들에 포함되지 않도록 동적 import
    const MediaLibrary = await import('expo-media-library');
    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) return { ok: false, reason: 'denied' };

    const res = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.VIDEO,
      sortBy: [['creationTime', false]], // 촬영일 내림차순
      first: limit,
    });

    const swings: Swing[] = res.assets.map((a) => ({
      id: a.id,
      // creationTime: 갤러리에 기록된 촬영/저장 시각(ms)
      createdAt: a.creationTime,
      side: '영상', // 정면/측면은 영상 메타에 없음 → 이후 사용자/AI가 분류
      club: '스윙',
      uri: a.uri,
    }));
    return { ok: true, swings };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

/** 갤러리에서 스윙 영상 한 개를 선택 (촬영일 포함) */
export async function pickSwingFromGallery(): Promise<Swing | null> {
  if (Platform.OS === 'web') return null;
  try {
    const ImagePicker = await import('expo-image-picker');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });
    if (result.canceled || !result.assets?.length) return null;

    const asset = result.assets[0];
    // 픽커가 주는 파일은 원본 촬영일이 유실될 수 있어, 있으면 사용하고 없으면 지금 시각
    const createdAt =
      typeof (asset as any).creationTime === 'number' ? (asset as any).creationTime : Date.now();

    return {
      id: asset.assetId ?? asset.uri,
      createdAt,
      side: '영상',
      club: '스윙',
      uri: asset.uri,
    };
  } catch {
    return null;
  }
}
