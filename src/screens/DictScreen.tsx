import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, t as tt } from '../components/ui';
import { colors, radius, weight } from '../theme/tokens';

type Entry = { term: string; type: '설명' | '영상'; body: string; yt?: string };

const DICT: Entry[] = [
  { term: '임팩트', type: '설명', body: '클럽 헤드가 공에 맞는 순간. 손이 공보다 살짝 앞선 상태가 이상적이에요.' },
  { term: '릴리즈', type: '영상', body: '임팩트 구간에서 손목 코킹을 풀어주는 동작.', yt: 'youtu.be/doh-release' },
  { term: '템포', type: '설명', body: '백스윙과 다운스윙의 시간 비율. 보통 3:1이 안정적이에요.' },
  { term: '캐스팅', type: '영상', body: '다운스윙 초반에 손목이 일찍 풀리는 대표적 실수.', yt: 'youtu.be/doh-casting' },
  { term: '레깅 (래그)', type: '설명', body: '다운스윙에서 손목 각을 최대한 유지하는 것. 비거리의 핵심.' },
  { term: '스웨이', type: '영상', body: '백스윙에서 몸이 오른쪽으로 밀리는 실수.', yt: 'youtu.be/doh-sway' },
];

export default function DictScreen() {
  const [q, setQ] = useState('');
  const query = q.trim();
  const list = DICT.filter((d) => !query || d.term.includes(query) || d.body.includes(query));

  return (
    <Screen>
      <Text style={[tt.screenTitle, { fontSize: 22 }]}>골프 사전</Text>
      <Text style={tt.subtitle}>궁금한 용어를 검색하면 영상이나 설명을 볼 수 있어요.</Text>

      <View style={styles.searchBar}>
        <Text style={{ fontSize: 15, color: 'rgba(27,38,32,.4)' }}>🔍</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="예: 임팩트, 릴리즈, 템포"
          placeholderTextColor="rgba(27,38,32,.4)"
          style={styles.input}
        />
      </View>

      {list.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>'{query}'에 대한 결과가 없어요.</Text>
          <Text style={styles.emptySub}>데이터는 계속 추가될 예정이에요.</Text>
        </View>
      ) : (
        <View style={{ gap: 9, marginTop: 14 }}>
          {list.map((d) => {
            const isVideo = d.type === '영상';
            return (
              <Card key={d.term} style={{ padding: 15, borderColor: 'rgba(27,38,32,.09)' }}>
                <View style={styles.termRow}>
                  <Text style={styles.term}>{d.term}</Text>
                  <View
                    style={[
                      styles.typeTag,
                      { backgroundColor: isVideo ? 'rgba(176,122,46,.14)' : 'rgba(46,92,68,.1)' },
                    ]}
                  >
                    <Text style={{ fontSize: 10, fontWeight: weight.black, color: isVideo ? colors.gold : colors.accentGreen }}>
                      {d.type}
                    </Text>
                  </View>
                </View>
                <Text style={styles.body}>{d.body}</Text>
                {isVideo ? (
                  <View style={styles.ytPill}>
                    <Text style={styles.ytText}>▶ 유튜브에서 보기 · {d.yt}</Text>
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 4,
  },
  input: { flex: 1, fontSize: 14, fontWeight: weight.semibold, color: colors.ink, paddingVertical: 10 },
  termRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  term: { fontSize: 15, fontWeight: weight.black, color: colors.ink },
  typeTag: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill },
  body: { fontSize: 12.5, color: 'rgba(27,38,32,.6)', marginTop: 6, lineHeight: 19 },
  ytPill: { marginTop: 10, alignSelf: 'flex-start', paddingHorizontal: 13, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: 'rgba(176,122,46,.1)' },
  ytText: { fontSize: 11.5, fontWeight: weight.black, color: colors.gold },
  empty: { alignItems: 'center', paddingVertical: 34, paddingHorizontal: 16 },
  emptyText: { color: colors.textFaint, fontSize: 13, fontWeight: weight.semibold, textAlign: 'center' },
  emptySub: { color: colors.textFaint, fontSize: 11.5, marginTop: 4 },
});
