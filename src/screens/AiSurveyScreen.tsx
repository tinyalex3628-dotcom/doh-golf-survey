import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, DarkCard, Press, PrimaryButton, ProgressBar, SectionLabel, t as tt } from '../components/ui';
import { UploadSlots, UploadState } from '../components/UploadSlots';
import { colors, radius, weight } from '../theme/tokens';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';

type Phase = 'intro' | 'survey1' | 'register' | 'survey2' | 'result' | 'physical';
type Q = { id: string; q: string; opts: string[] };

const SURVEY1: Q[] = [
  { id: 'q1', q: '골프 경력이 어느 정도 되세요?', opts: ['6개월 미만', '6개월~2년', '2~5년', '5년 이상'] },
  { id: 'q2', q: '이번에 분석할 클럽은?', opts: ['드라이버', '아이언', '웨지', '퍼터'] },
  { id: 'q3', q: '평균 스코어대는?', opts: ['100타 이상', '90타대', '80타대', '70타대'] },
  { id: 'q4', q: '이번 분석의 목표는?', opts: ['비거리', '방향성', '일관성', '자세 교정'] },
  { id: 'q5', q: '가장 고민되는 구간은?', opts: ['어드레스·백스윙', '탑', '임팩트', '팔로우·피니시'] },
  { id: 'q6', q: '요즘 자주 나는 실수는?', opts: ['슬라이스', '훅', '뒤땅·토핑', '잘 모르겠어요'] },
  { id: 'q7', q: '일주일 연습 빈도는?', opts: ['거의 못해요', '1~2회', '3~4회', '5회 이상'] },
  { id: 'q8', q: '불편한 신체 부위가 있나요?', opts: ['없어요', '허리', '어깨', '무릎'] },
];
const SURVEY2: Q[] = [
  { id: 'r1', q: '방금 스윙, 힘이 잘 전달되는 느낌이었나요?', opts: ['그렇다', '보통', '아니다'] },
  { id: 'r2', q: '평소 스윙과 비교하면 어땠나요?', opts: ['평소와 비슷', '더 좋았어요', '더 안 좋았어요'] },
  { id: 'r3', q: '오늘 몸 상태(컨디션)는?', opts: ['좋아요', '보통', '안 좋아요'] },
];
const PHYS = [
  { name: '어깨 회전 유연성', desc: '상체 회전 가동 범위' },
  { name: '골반 분리 (X-Factor)', desc: '상·하체 분리 능력' },
  { name: '코어 안정성', desc: '스윙 중 몸통을 버티는 힘' },
  { name: '발목 가동성', desc: '체중 이동 안정성' },
];
const INTRO_STEPS = [
  { n: 1, title: '간단한 설문 (8문항)', desc: '경력·목표·습관 파악', gold: false },
  { n: 2, title: '스윙 등록', desc: '정면·측면 영상 업로드', gold: false },
  { n: 3, title: '추가 질문 → 결과', desc: '맞춤 분석 · 신체 테스트 제안', gold: true },
];

export default function AiSurveyScreen() {
  const { go } = useNav();
  const { showToast } = useToast();

  const [phase, setPhase] = useState<Phase>('intro');
  const [i, setI] = useState(0);
  const [a1, setA1] = useState<Record<string, string>>({});
  const [a2, setA2] = useState<Record<string, string>>({});
  const [up, setUp] = useState<UploadState>([false, false]);

  const isS2 = phase === 'survey2';
  const survey = isS2 ? SURVEY2 : SURVEY1;
  const q = survey[i] ?? survey[0];
  const ans = isS2 ? a2 : a1;
  const setAns = isS2 ? setA2 : setA1;
  const canNext = ans[q.id] != null;
  const total = survey.length;

  const next = () => {
    if (i < survey.length - 1) return setI(i + 1);
    if (phase === 'survey1') {
      setPhase('register');
      setI(0);
    } else if (phase === 'survey2') {
      setPhase('result');
    }
  };
  const prev = () => {
    if (i > 0) return setI(i - 1);
    if (phase === 'survey2') return setPhase('register');
    if (phase === 'register') {
      setPhase('survey1');
      setI(SURVEY1.length - 1);
    } else if (phase === 'survey1') {
      setPhase('intro');
    }
  };
  const toggle = (idx: number) => setUp((p) => (idx === 0 ? [!p[0], p[1]] : [p[0], !p[1]]));

  // ── intro ──
  if (phase === 'intro') {
    return (
      <Screen>
        <DarkCard style={{ padding: 20 }}>
          <SectionLabel style={{ color: colors.goldLight, letterSpacing: 1 }}>AI 스윙분석</SectionLabel>
          <Text style={styles.introTitle}>몇 가지만 알려주시면{'\n'}더 정확하게 분석해요</Text>
          <Text style={styles.introDesc}>
            체형·목표·습관에 따라 좋은 스윙은 달라져요. 분석 전 간단한 설문으로 나를 이해할게요.
          </Text>
        </DarkCard>
        <View style={{ gap: 9, marginTop: 16 }}>
          {INTRO_STEPS.map((s) => (
            <Card key={s.n} style={styles.stepRow}>
              <View style={[styles.stepNum, { backgroundColor: s.gold ? 'rgba(176,122,46,.14)' : 'rgba(46,92,68,.1)' }]}>
                <Text style={{ fontSize: 13, fontWeight: weight.black, color: s.gold ? colors.gold : colors.accentGreen }}>
                  {s.n}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </Card>
          ))}
        </View>
        <PrimaryButton label="설문 시작하기 ›" onPress={() => { setPhase('survey1'); setI(0); }} style={{ marginTop: 16 }} />
      </Screen>
    );
  }

  // ── survey (1 & 2) ──
  if (phase === 'survey1' || phase === 'survey2') {
    const pct = Math.round(((i + 1) / total) * 100);
    return (
      <Screen>
        <Text style={styles.progressLabel}>{(isS2 ? '추가 질문 ' : '') + (i + 1) + ' / ' + total}</Text>
        <View style={{ marginTop: 8 }}>
          <ProgressBar value={pct} height={6} />
        </View>
        <Text style={styles.question}>{q.q}</Text>
        <View style={{ gap: 9, marginTop: 18 }}>
          {q.opts.map((o) => {
            const on = ans[q.id] === o;
            return (
              <Press key={o} activeScale={0.99} onPress={() => setAns((m) => ({ ...m, [q.id]: o }))}>
                {on ? (
                  <DarkCard style={[styles.optBase, styles.optOn]}>
                    <OptBody label={o} on />
                  </DarkCard>
                ) : (
                  <View style={[styles.optBase, styles.optIdle]}>
                    <OptBody label={o} on={false} />
                  </View>
                )}
              </Press>
            );
          })}
        </View>
        <View style={styles.navRow}>
          <Press onPress={prev} activeScale={0.98} style={styles.prevBtn}>
            <Text style={styles.prevText}>이전</Text>
          </Press>
          <PrimaryButton label="다음" enabled={canNext} onPress={next} style={{ flex: 1 }} />
        </View>
      </Screen>
    );
  }

  // ── register ──
  if (phase === 'register') {
    return (
      <Screen>
        <Text style={[tt.screenTitle, { fontSize: 20 }]}>이제 스윙을 등록해주세요</Text>
        <Text style={tt.subtitle}>정면과 측면을 올리면 더 정확하게 분석해요.</Text>
        <UploadSlots value={up} onToggle={toggle} />
        <View style={styles.navRow}>
          <Press onPress={prev} activeScale={0.98} style={styles.prevBtn}>
            <Text style={styles.prevText}>이전</Text>
          </Press>
          <PrimaryButton label="등록 완료 · 계속" onPress={() => { setPhase('survey2'); setI(0); }} style={{ flex: 1 }} />
        </View>
      </Screen>
    );
  }

  // ── physical ──
  if (phase === 'physical') {
    return (
      <Screen>
        <Text style={[tt.screenTitle, { fontSize: 20 }]}>신체 테스트</Text>
        <Text style={tt.subtitle}>각 항목을 안내에 따라 측정해요. (측정 UI는 준비 중)</Text>
        <View style={{ gap: 10, marginTop: 16 }}>
          {PHYS.map((p) => (
            <Card key={p.name} style={styles.physRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.physName}>{p.name}</Text>
                <Text style={styles.physDesc}>{p.desc}</Text>
              </View>
              <View style={styles.measureBtn}>
                <Text style={styles.measureText}>측정</Text>
              </View>
            </Card>
          ))}
        </View>
        <PrimaryButton
          label="테스트 완료"
          onPress={() => {
            showToast('분석을 저장했어요');
            go('hub1');
          }}
          style={{ marginTop: 16 }}
        />
      </Screen>
    );
  }

  // ── result ──
  return (
    <Screen>
      <DarkCard style={{ padding: 20 }}>
        <SectionLabel style={{ color: colors.goldLight, letterSpacing: 1 }}>AI 분석 결과 · 참고용</SectionLabel>
        <View style={styles.resultHead}>
          <ScoreGauge score={72} />
          <Text style={styles.resultHeadText}>임팩트 구간 개선이{'\n'}가장 필요해요</Text>
        </View>
      </DarkCard>

      <View style={{ gap: 9, marginTop: 12 }}>
        <Card style={styles.fbCard}>
          <Text style={[styles.fbLabel, { color: colors.gold }]}>핵심 피드백</Text>
          <Text style={styles.fbBody}>
            임팩트(P4)에서 골반 회전이 어깨보다 늦게 시작돼요. 하체 리드를 먼저 만들어보세요.
          </Text>
        </Card>
        <Card style={styles.fbCard}>
          <Text style={[styles.fbLabel, { color: colors.accentGreen }]}>잘하고 있는 점</Text>
          <Text style={styles.fbBody}>백스윙 템포가 안정적이에요. 지금 리듬을 유지하세요.</Text>
        </Card>
      </View>

      <View style={styles.physCta}>
        <Text style={styles.physCtaTitle}>더 정확하게 알고 싶다면?{'\n'}신체 테스트도 해볼까요?</Text>
        <Text style={styles.physCtaDesc}>유연성·균형을 확인하면 나에게 맞는 스윙을 더 잘 찾을 수 있어요.</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Press onPress={() => { showToast('분석을 저장했어요'); go('hub1'); }} activeScale={0.98} style={[styles.physCtaBtn, styles.physCtaLater]}>
            <Text style={styles.physCtaLaterText}>나중에</Text>
          </Press>
          <Press onPress={() => setPhase('physical')} activeScale={0.98} style={[styles.physCtaBtn, styles.physCtaGo]}>
            <Text style={styles.physCtaGoText}>테스트 하기 ›</Text>
          </Press>
        </View>
      </View>
      <Press onPress={() => { setPhase('intro'); setI(0); setA1({}); setA2({}); }} activeScale={1} style={{ marginTop: 10 }}>
        <Text style={styles.restart}>설문 다시 하기</Text>
      </Press>
    </Screen>
  );
}

function OptBody({ label, on }: { label: string; on: boolean }) {
  return (
    <>
      <Text style={{ fontSize: 14, fontWeight: weight.black, color: on ? colors.onDark : colors.ink }}>{label}</Text>
      <View style={[styles.check, on ? styles.checkOn : styles.checkOff]}>
        {on ? <Text style={{ fontSize: 12, fontWeight: weight.black, color: colors.bezelBlack }}>✓</Text> : null}
      </View>
    </>
  );
}

function ScoreGauge({ score }: { score: number }) {
  // conic-gradient 대체: 링 + 중앙 원
  return (
    <View style={styles.gaugeOuter}>
      <View style={styles.gaugeRing} />
      <View style={styles.gaugeInner}>
        <Text style={styles.gaugeScore}>{score}</Text>
        <Text style={styles.gaugeLabel}>SCORE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  introTitle: { fontSize: 22, fontWeight: weight.black, color: colors.onDark, marginTop: 6, letterSpacing: -0.4, lineHeight: 29 },
  introDesc: { fontSize: 12, color: 'rgba(247,244,236,.62)', marginTop: 8, lineHeight: 19 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.chip },
  stepNum: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  stepTitle: { fontSize: 13.5, fontWeight: weight.black, color: colors.ink },
  stepDesc: { fontSize: 11, color: colors.textWeak, marginTop: 1 },

  progressLabel: { fontSize: 11, fontWeight: weight.black, color: colors.gold, letterSpacing: 0.4, paddingTop: 2 },
  question: { fontSize: 20, fontWeight: weight.black, letterSpacing: -0.4, color: colors.ink, marginTop: 20, lineHeight: 27 },
  optBase: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 17, borderRadius: radius.chip },
  optIdle: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.borderSoft },
  optOn: { borderWidth: 1.5, borderColor: colors.ink },
  check: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.goldLight },
  checkOff: { borderWidth: 1.5, borderColor: 'rgba(27,38,32,.2)' },
  navRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  prevBtn: { paddingVertical: 15, paddingHorizontal: 18, borderRadius: radius.chip, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  prevText: { fontSize: 14, fontWeight: weight.black, color: colors.ink },

  physRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.chip },
  physName: { fontSize: 14, fontWeight: weight.black, color: colors.ink },
  physDesc: { fontSize: 11, color: colors.textWeak, marginTop: 1 },
  measureBtn: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: radius.pill, backgroundColor: 'rgba(46,92,68,.1)' },
  measureText: { fontSize: 12, fontWeight: weight.black, color: colors.accentGreen },

  resultHead: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 },
  resultHeadText: { flex: 1, fontSize: 15, fontWeight: weight.black, color: colors.onDark, lineHeight: 21 },
  gaugeOuter: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  gaugeRing: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 38, borderWidth: 5, borderColor: colors.goldLight, borderRightColor: 'rgba(247,244,236,.14)', borderBottomColor: 'rgba(247,244,236,.14)', transform: [{ rotate: '45deg' }] },
  gaugeInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  gaugeScore: { fontSize: 22, fontWeight: weight.black, color: colors.goldLight },
  gaugeLabel: { fontSize: 8.5, color: colors.onDarkSecondary },

  fbCard: { padding: 14, borderRadius: radius.chip, borderColor: 'rgba(27,38,32,.09)' },
  fbLabel: { fontSize: 9.5, fontWeight: weight.black, letterSpacing: 0.5 },
  fbBody: { fontSize: 13.5, fontWeight: weight.bold, color: colors.ink, marginTop: 4, lineHeight: 20 },

  physCta: { marginTop: 14, padding: 16, borderRadius: radius.card, backgroundColor: 'rgba(176,122,46,.09)', borderWidth: 1, borderColor: 'rgba(176,122,46,.25)' },
  physCtaTitle: { fontSize: 14.5, fontWeight: weight.black, color: colors.ink, lineHeight: 20 },
  physCtaDesc: { fontSize: 11.5, color: 'rgba(27,38,32,.6)', marginTop: 6, lineHeight: 18 },
  physCtaBtn: { flex: 1, paddingVertical: 13, borderRadius: radius.iconTile, alignItems: 'center' },
  physCtaLater: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft },
  physCtaLaterText: { fontSize: 13, fontWeight: weight.black, color: colors.ink },
  physCtaGo: { backgroundColor: colors.ink },
  physCtaGoText: { fontSize: 13, fontWeight: weight.black, color: colors.onDark },
  restart: { textAlign: 'center', fontSize: 11.5, fontWeight: weight.bold, color: colors.textFaint },
});
