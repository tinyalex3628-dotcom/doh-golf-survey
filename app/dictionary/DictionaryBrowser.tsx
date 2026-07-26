"use client";

// 골프 사전 — 검색 + 카테고리 필터 (디자인 핸드오프 16번 화면의 PC 버전)

import { useMemo, useState } from "react";
import { Icon, IC } from "@/components/site-chrome";

type Term = { name: string; en?: string; cat: string; desc: string };

const CATS = ["전체", "스윙 구간", "스윙 동작", "구질 · 미스샷", "셋업 · 기본", "장비"];

const TERMS: Term[] = [
  // ── 스윙 구간 (P 시스템) ──
  {
    name: "P 시스템 (P1–P10)",
    en: "P-System",
    cat: "스윙 구간",
    desc: "스윙을 10개 구간으로 나눠 부르는 방법이에요. P1 어드레스에서 시작해 P4 백스윙 톱, P7 임팩트를 지나 P10 피니시로 끝나요. 프로와 내 스윙을 같은 구간끼리 비교할 때 기준이 됩니다.",
  },
  {
    name: "어드레스 (P1)",
    en: "Address",
    cat: "스윙 구간",
    desc: "공을 치기 전 준비 자세예요. 그립·정렬·자세·공 위치가 모두 여기서 결정되고, 스윙 문제의 절반은 어드레스에서 시작돼요.",
  },
  {
    name: "테이크백 (P2)",
    en: "Takeaway",
    cat: "스윙 구간",
    desc: "클럽이 움직이기 시작해 샤프트가 지면과 평행해질 때까지의 첫 구간이에요. 손이 아니라 어깨 턴으로 시작해야 스윙 궤도가 안정돼요.",
  },
  {
    name: "백스윙 톱 (P4)",
    en: "Top of Backswing",
    cat: "스윙 구간",
    desc: "백스윙이 가장 높이 올라간 지점이에요. 여기서 왼팔 각도와 손목 코킹이 잘 유지되어야 다운스윙에서 힘을 제대로 쓸 수 있어요.",
  },
  {
    name: "전환 (P5, 트랜지션)",
    en: "Transition",
    cat: "스윙 구간",
    desc: "백스윙에서 다운스윙으로 방향이 바뀌는 순간이에요. 상체보다 하체가 먼저 움직여야 하고, 서두르면 스윙 궤도가 바깥으로 무너져요.",
  },
  {
    name: "임팩트 (P7)",
    en: "Impact",
    cat: "스윙 구간",
    desc: "클럽이 공과 만나는 순간이에요. 아이언은 손이 공보다 앞에 있는 핸드퍼스트 상태로 맞아야 정타가 나요.",
  },
  {
    name: "팔로스루 · 피니시 (P8–P10)",
    en: "Follow Through / Finish",
    cat: "스윙 구간",
    desc: "임팩트 이후 클럽이 뻗어나가 마무리되는 구간이에요. 피니시가 흔들리면 그 앞 구간 어딘가에서 균형이 무너졌다는 신호예요.",
  },

  // ── 스윙 동작 ──
  {
    name: "템포",
    en: "Tempo",
    cat: "스윙 동작",
    desc: "백스윙과 다운스윙의 전체적인 빠르기 리듬이에요. 보통 백스윙 3 : 다운스윙 1의 비율이 이상적이라고 해요. 좋은 스윙은 빨라 보이지 않고 부드러워 보여요.",
  },
  {
    name: "코킹",
    en: "Wrist Cock",
    cat: "스윙 동작",
    desc: "백스윙에서 손목을 엄지 쪽으로 꺾어 클럽과 팔 사이에 각을 만드는 동작이에요. 이 각이 비거리의 저금통 역할을 해요.",
  },
  {
    name: "레깅 (래그)",
    en: "Lag",
    cat: "스윙 동작",
    desc: "다운스윙에서 손목 각을 늦게까지 유지해 클럽 헤드가 손보다 뒤에서 따라오는 상태예요. 래그가 좋으면 힘 안 들이고도 헤드 스피드가 나와요.",
  },
  {
    name: "릴리즈",
    en: "Release",
    cat: "스윙 동작",
    desc: "임팩트 구간에서 유지하던 손목 각을 풀어주며 클럽 헤드를 공에 던져주는 동작이에요. 너무 이르면 캐스팅, 너무 늦으면 밀린 샷이 나요.",
  },
  {
    name: "캐스팅",
    en: "Casting",
    cat: "스윙 동작",
    desc: "다운스윙 시작부터 손목 각을 일찍 풀어버리는 실수예요. 낚싯대 던지듯 헤드가 먼저 풀려서 비거리가 줄고 뒤땅·탑핑의 원인이 돼요.",
  },
  {
    name: "스웨이",
    en: "Sway",
    cat: "스윙 동작",
    desc: "백스윙 때 몸이 회전하지 않고 오른쪽으로 밀려 나가는 동작이에요. 축이 무너져서 정타 확률이 크게 떨어져요.",
  },
  {
    name: "스윙 플레인",
    en: "Swing Plane",
    cat: "스윙 동작",
    desc: "스윙 중 클럽이 그리는 궤도의 기울어진 면이에요. 측면 영상에 선을 그어 보면 내 클럽이 플레인 위로 넘어가는지 아래로 처지는지 확인할 수 있어요.",
  },
  {
    name: "플라잉 엘보",
    en: "Flying Elbow",
    cat: "스윙 동작",
    desc: "백스윙 톱에서 오른쪽 팔꿈치가 몸에서 떨어져 하늘로 벌어지는 자세예요. 스윙 궤도가 바깥에서 들어오게 되어 슬라이스의 단골 원인이에요.",
  },
  {
    name: "치킨윙",
    en: "Chicken Wing",
    cat: "스윙 동작",
    desc: "임팩트 이후 왼팔 팔꿈치가 접혀 닭 날개처럼 들리는 동작이에요. 팔이 펴지지 못해 방향과 비거리를 모두 잃어요.",
  },
  {
    name: "얼리 익스텐션",
    en: "Early Extension",
    cat: "스윙 동작",
    desc: "다운스윙에서 엉덩이가 공 쪽으로 다가가며 상체가 일찍 일어서는 동작이에요. 손이 지나갈 공간이 없어져 생크나 밀린 샷이 나와요.",
  },
  {
    name: "헤드업",
    en: "Head Up",
    cat: "스윙 동작",
    desc: "임팩트 전에 머리를 들어 공에서 시선이 떨어지는 동작이에요. 사실은 머리보다 상체가 함께 일어나는 게 문제인 경우가 많아요.",
  },
  {
    name: "체중 이동",
    en: "Weight Shift",
    cat: "스윙 동작",
    desc: "백스윙에서 오른발, 다운스윙에서 왼발로 체중을 옮기는 흐름이에요. 이동이 늦으면 뒤땅, 안 되면 거리 손실로 이어져요.",
  },

  // ── 구질 · 미스샷 ──
  {
    name: "슬라이스",
    en: "Slice",
    cat: "구질 · 미스샷",
    desc: "공이 오른쪽으로 크게 휘어 나가는 구질이에요(오른손 기준). 아웃-인 궤도와 열린 클럽 페이스가 만나면 나와요. 아마추어가 가장 많이 겪는 미스예요.",
  },
  {
    name: "훅",
    en: "Hook",
    cat: "구질 · 미스샷",
    desc: "공이 왼쪽으로 급하게 감겨 들어가는 구질이에요. 클럽 페이스가 궤도보다 많이 닫혀 있을 때 나와요.",
  },
  {
    name: "페이드 / 드로우",
    en: "Fade / Draw",
    cat: "구질 · 미스샷",
    desc: "의도적으로 만드는 부드러운 좌우 휘어짐이에요. 오른쪽으로 살짝 휘면 페이드, 왼쪽으로 살짝 감기면 드로우. 컨트롤되는 휘어짐은 무기가 돼요.",
  },
  {
    name: "뒤땅 (더프)",
    en: "Duff / Fat Shot",
    cat: "구질 · 미스샷",
    desc: "공보다 뒤의 땅을 먼저 치는 미스예요. 체중이 오른발에 남아 있거나 캐스팅으로 최저점이 공 뒤로 당겨질 때 나와요.",
  },
  {
    name: "탑핑",
    en: "Topping / Thin Shot",
    cat: "구질 · 미스샷",
    desc: "클럽 날이 공의 윗부분을 때려 낮게 굴러가는 미스예요. 임팩트 때 몸이 일어서거나 공과의 거리가 멀어질 때 자주 나와요.",
  },
  {
    name: "생크",
    en: "Shank",
    cat: "구질 · 미스샷",
    desc: "클럽 헤드와 샤프트가 만나는 호젤에 공이 맞아 오른쪽으로 튀는 미스예요. 얼리 익스텐션으로 손이 공 쪽으로 가까워지는 게 흔한 원인이에요.",
  },

  // ── 셋업 · 기본 ──
  {
    name: "그립",
    en: "Grip",
    cat: "셋업 · 기본",
    desc: "클럽을 잡는 방법이에요. 손등 방향에 따라 스트롱·뉴트럴·위크로 나뉘고, 구질에 가장 큰 영향을 주는 기본기예요.",
  },
  {
    name: "얼라인먼트 (정렬)",
    en: "Alignment",
    cat: "셋업 · 기본",
    desc: "발·무릎·어깨 라인을 목표 방향과 나란히 맞추는 것이에요. 몸이 오른쪽을 보고 서 있으면 스윙이 좋아도 공은 엉뚱한 곳으로 가요.",
  },
  {
    name: "볼 포지션",
    en: "Ball Position",
    cat: "셋업 · 기본",
    desc: "스탠스 안에서 공을 두는 위치예요. 드라이버는 왼발 뒤꿈치 안쪽, 아이언은 클럽이 짧아질수록 가운데 쪽으로 옮겨요.",
  },
  {
    name: "핸드퍼스트",
    en: "Hands First / Forward Press",
    cat: "셋업 · 기본",
    desc: "임팩트에서 손이 클럽 헤드보다 목표 쪽에 먼저 있는 상태예요. 아이언 다운블로의 핵심이고, 이게 되면 공이 먼저 맞고 잔디가 나중에 맞아요.",
  },

  // ── 장비 ──
  {
    name: "로프트",
    en: "Loft",
    cat: "장비",
    desc: "클럽 페이스가 하늘을 향해 누운 각도예요. 로프트가 클수록 공이 높이 뜨고 거리가 짧아져요. 번호가 클수록 로프트도 커요.",
  },
  {
    name: "라이각",
    en: "Lie Angle",
    cat: "장비",
    desc: "클럽을 바닥에 두었을 때 샤프트와 지면이 이루는 각도예요. 키와 체형에 안 맞으면 같은 스윙에도 공이 한쪽으로만 가요.",
  },
  {
    name: "샤프트 강도 (플렉스)",
    en: "Shaft Flex",
    cat: "장비",
    desc: "샤프트가 휘어지는 정도예요. L·A·R·SR·S 순으로 단단해지고, 헤드 스피드에 맞는 강도를 써야 타이밍이 맞아요.",
  },
  {
    name: "바운스",
    en: "Bounce",
    cat: "장비",
    desc: "웨지 밑면(솔)이 지면에 대해 들려 있는 각도예요. 바운스가 크면 클럽이 땅에 박히지 않고 미끄러져서 뒤땅에 관대해요.",
  },
];

export default function DictionaryBrowser() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("전체");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return TERMS.filter((t) => {
      if (cat !== "전체" && t.cat !== cat) return false;
      if (!query) return true;
      return (
        t.name.toLowerCase().includes(query) ||
        (t.en ?? "").toLowerCase().includes(query) ||
        t.desc.toLowerCase().includes(query)
      );
    });
  }, [q, cat]);

  return (
    <div>
      <div className="hp-dict-controls">
        <label className="hp-dict-search">
          <Icon d={IC.search} size={16} sw={2} />
          <input
            type="search"
            placeholder="용어 검색 — 예) 슬라이스, 래그, 임팩트"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <div className="hp-dict-cats">
          {CATS.map((c) => (
            <button
              key={c}
              className={`hp-dict-cat ${cat === c ? "on" : ""}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="hp-dict-empty">
          <b>“{q}”에 대한 결과가 없어요</b>
          <span>다른 표현으로 검색해 보시거나, 1:1로 프로에게 직접 물어보세요.</span>
        </div>
      ) : (
        <div className="hp-dict-grid">
          {filtered.map((t) => (
            <div className="hp-dict-card" key={t.name}>
              <div className="top">
                <b>{t.name}</b>
                <span className="cat">{t.cat}</span>
              </div>
              {t.en && <span className="en">{t.en}</span>}
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      )}

      <p className="hp-plan-note" style={{ marginTop: 32 }}>
        찾는 용어가 없나요? 스윙 진단을 신청하면서 궁금한 점을 함께 적어주시면 피드백에서
        답해드려요.
      </p>
    </div>
  );
}
