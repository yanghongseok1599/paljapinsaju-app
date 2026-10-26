/**
 * 사주 결과지 해석 엔진.
 *
 * AI를 부르지 않고 사주 원국에서 계산한 사실만으로 해석문을 만든다.
 * 돈이 들지 않고, 없는 내용을 지어내지 않는다.
 *
 * 판단 재료 (category-analysis.ts 의 collectFacts 를 그대로 쓴다)
 *  - 일간(日干): 나 자신. 성향의 기준점
 *  - 십신 분포: 비겁·식상·재성·관성·인성 각각 몇 개인지
 *  - 오행 강약: 가장 센 기운과 가장 약한 기운
 *  - 일지 합충: 배우자 자리가 붙어 있는지 부딪히는지
 *  - 도화·역마·양인·괴강
 *  - 현재 대운(10년 흐름)과 올해 세운
 *
 * 같은 생년월일이면 늘 같은 결과가 나온다(결정론적). 사람이 다르면 내용도 달라진다.
 */
import { josa } from "@/lib/saju/josa";
import {
  collectFacts,
  type CategoryAnalysisInput,
  type Facts,
  type SipsinGroup,
} from "@/lib/saju/category-analysis";

/** 십신을 일상어로 */
const GROUP_MEANING: Record<SipsinGroup, string> = {
  비겁: "자기 주장과 경쟁",
  식상: "표현과 새로운 시도",
  재성: "돈과 현실 감각",
  관성: "책임과 조직 생활",
  인성: "배움과 받쳐주는 힘",
};

/** 일간별 기질 — 천간 10개 */
const DAY_STEM_TRAIT: Record<string, { core: string; strength: string; risk: string }> = {
  甲: { core: "곧게 위로 자라는 큰 나무", strength: "방향이 정해지면 흔들리지 않고 밀고 나갑니다", risk: "한번 정한 길을 바꾸기 어려워, 상황이 변해도 고집으로 버티기 쉽습니다" },
  乙: { core: "휘어지되 꺾이지 않는 풀과 덩굴", strength: "상황에 맞춰 유연하게 자리를 잡습니다", risk: "기대고 싶은 대상을 찾다 보니 결정을 남에게 미루는 버릇이 생깁니다" },
  丙: { core: "온 세상을 비추는 태양", strength: "존재만으로 분위기를 바꾸고 사람을 끌어당깁니다", risk: "감정이 그대로 드러나 뒷수습이 필요한 순간이 많습니다" },
  丁: { core: "어둠 속에서 길을 밝히는 촛불", strength: "가까운 사람을 세심하게 살피고 속을 꿰뚫어 봅니다", risk: "마음 쓴 만큼 돌아오지 않으면 혼자 소진됩니다" },
  戊: { core: "모든 것을 받쳐주는 넓은 대지", strength: "쉽게 흔들리지 않아 사람들이 기대고 싶어 합니다", risk: "움직여야 할 때 미루다 기회가 지나갑니다" },
  己: { core: "씨앗을 품어 길러내는 기름진 밭", strength: "남을 키우고 중간에서 조율하는 데 탁월합니다", risk: "속으로만 담아두다 어느 순간 한꺼번에 터집니다" },
  庚: { core: "제련을 기다리는 단단한 쇠", strength: "옳고 그름이 분명하고 결단이 빠릅니다", risk: "말이 날카로워 본심과 다르게 전달됩니다" },
  辛: { core: "다듬어져 빛나는 보석", strength: "감각이 예민해 디테일에서 차이를 만듭니다", risk: "스스로에게 엄격해 작은 흠에도 자신을 깎아내립니다" },
  壬: { core: "쉼 없이 흐르는 큰 강물", strength: "생각의 폭이 넓고 상황을 멀리 봅니다", risk: "한곳에 머물지 못해 시작한 일이 쌓이지 않습니다" },
  癸: { core: "땅속으로 스며드는 맑은 물", strength: "눈치가 빠르고 분위기를 먼저 읽습니다", risk: "속내를 감추다 오해를 사고 혼자 끙끙 앓습니다" },
};


/**
 * 십신·운성 한자를 사람이 읽을 수 있게 바꾼다.
 * saju-engine 은 한자로 돌려주는데(劫財, 正印, 墓 …) 그대로 쓰면
 * 사주를 모르는 사람은 한 글자도 못 읽는다.
 */
const SIPSIN_READABLE: Record<string, string> = {
  比肩: "비견(나와 같은 편)", 劫財: "겁재(내 몫을 나눠 갖는 기운)",
  食神: "식신(편안한 표현)", 傷官: "상관(날카로운 표현)",
  偏財: "편재(크게 움직이는 돈)", 正財: "정재(꾸준히 들어오는 돈)",
  偏官: "편관(압박이 센 책임)", 正官: "정관(안정적인 자리)",
  偏印: "편인(비주류 배움)", 正印: "정인(정통 배움)",
  本元: "일간 자신",
};

/** 12운성 — 기운이 지금 얼마나 힘을 쓸 수 있는지 */
const UNSEONG_READABLE: Record<string, string> = {
  長生: "장생(기운이 막 살아나는 단계)", 沐浴: "목욕(아직 불안정한 단계)",
  冠帶: "관대(자리를 잡아가는 단계)", 建祿: "건록(힘이 충실한 단계)",
  帝旺: "제왕(가장 힘이 센 단계)", 衰: "쇠(기운이 꺾이기 시작하는 단계)",
  病: "병(힘이 약해진 단계)", 死: "사(힘을 거의 못 쓰는 단계)",
  墓: "묘(안으로 갈무리하는 단계)", 絶: "절(끊어졌다 다시 시작하는 단계)",
  胎: "태(새로 잉태되는 단계)", 養: "양(길러지는 단계)",
};

function readSipsin(v: string): string {
  return SIPSIN_READABLE[v] ?? v;
}

function readUnseong(v: string): string {
  return UNSEONG_READABLE[v] ?? v;
}

/** 많다/적다 판정 */
function level(n: number): "없음" | "적음" | "보통" | "많음" {
  if (n === 0) return "없음";
  if (n === 1) return "적음";
  if (n <= 3) return "보통";
  return "많음";
}

/** 가장 많은 십신 */
function topGroup(counts: Record<SipsinGroup, number>): SipsinGroup {
  return (Object.entries(counts) as [SipsinGroup, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
}

/** 하나도 없는 십신들 */
function emptyGroups(counts: Record<SipsinGroup, number>): SipsinGroup[] {
  return (Object.entries(counts) as [SipsinGroup, number][])
    .filter(([, n]) => n === 0)
    .map(([g]) => g);
}

// ──────────────────────────────────────────────
// 섹션별 해석
// ──────────────────────────────────────────────

function overview(f: Facts, name: string): string {
  const trait = DAY_STEM_TRAIT[f.dayStem];
  const top = topGroup(f.counts);
  const empty = emptyGroups(f.counts);

  const parts = [
    `${name}님의 사주는 일간 ${josa(`${f.dayStem}(${f.dayStemKo})`, "을/를")} 중심으로 서 있습니다. ` +
      `일간은 사주 여덟 글자 가운데 '나 자신'에 해당하는 자리로, 모든 해석의 기준점입니다. ` +
      `${josa(f.dayStemKo, "은/는")} ${trait.core}에 비유합니다.`,

    `오행으로는 ${josa(f.strongest, "이/가")} 가장 강하고 ${josa(f.weakest, "이/가")} 약합니다. ` +
      `강한 쪽은 평소 저절로 쓰게 되는 힘이라 이미 ${name}님의 장점으로 자리 잡았을 가능성이 높고, ` +
      `약한 쪽은 평소에는 잘 드러나지 않다가 중요한 순간에 발목을 잡습니다.`,

    `십신으로 보면 ${top}(${GROUP_MEANING[top]})이 ${f.counts[top]}개로 가장 두텁습니다. ` +
      (empty.length > 0
        ? `반대로 ${empty.map((g) => `${g}(${GROUP_MEANING[g]})`).join(", ")}은 원국에 하나도 없습니다. ` +
          `없는 기운은 "그 분야가 나쁘다"가 아니라 "스스로 의식해서 채워야 하는 영역"이라는 뜻입니다.`
        : `다섯 기운이 비교적 고르게 자리해 한쪽으로 크게 치우치지는 않았습니다.`),

    `아래에서 이 구조가 성격, 관계, 일, 돈에서 각각 어떻게 작용하는지 나누어 봅니다.`,
  ];

  return parts.join(" ");
}

function personality(f: Facts, name: string): string {
  const trait = DAY_STEM_TRAIT[f.dayStem];
  const lines = [
    `${name}님의 기본 기질은 ${trait.strength}. 이것이 ${f.dayStemKo} 일간의 가장 큰 자산입니다.`,
    `다만 같은 기질이 뒤집히면 약점이 됩니다. ${trait.risk}.`,
  ];

  if (f.counts.비겁 >= 3) {
    lines.push(
      `비겁이 ${f.counts.비겁}개로 많습니다. 자기 기준이 뚜렷해 남의 말에 쉽게 휘둘리지 않는 대신, ` +
        `양보해야 할 자리에서도 버티다 관계가 상합니다. "이건 내가 맞다"는 확신이 들 때 한 박자 쉬는 연습이 필요합니다.`,
    );
  }
  if (f.counts.인성 >= 3) {
    lines.push(
      `인성이 ${f.counts.인성}개로 두텁습니다. 생각이 깊고 공부가 잘 붙는 반면, ` +
        `실행 전에 재는 시간이 길어 기회를 놓치기 쉽습니다. 완벽히 준비되기 전에 시작하는 편이 결과가 낫습니다.`,
    );
  }
  if (f.counts.식상 >= 3) {
    lines.push(
      `식상이 ${f.counts.식상}개로 많습니다. 표현력과 아이디어가 풍부하지만 하고 싶은 말을 참기 어렵습니다. ` +
        `중요한 자리에서는 말보다 글로 정리해 전달하는 쪽이 유리합니다.`,
    );
  }
  if (f.counts.관성 === 0) {
    lines.push(
      `관성이 원국에 없습니다. 정해진 틀에 자신을 맞추기보다 스스로 규칙을 만드는 편입니다. ` +
        `조직 생활에서 답답함을 느끼기 쉬우니, 재량이 있는 자리를 고르는 편이 오래갑니다.`,
    );
  }
  if (f.yangin) {
    lines.push(
      `양인(羊刃)이 있습니다. 밀어붙이는 힘이 아주 강해 결단이 빠른 대신 극단으로 흐르기 쉽습니다. ` +
        `중요한 결정에는 "여기까지만"이라는 선을 미리 정해두세요.`,
    );
  }
  if (f.goegang) {
    lines.push(
      `괴강(魁罡)이 있습니다. 존재감이 강해 평가가 중간에 머물지 않습니다. ` +
        `확실히 선택받거나 확실히 배제되는 쪽이라, 무난함을 노리기보다 색을 분명히 하는 편이 유리합니다.`,
    );
  }

  lines.push(
    `부족한 ${josa(f.weakest, "은/는")} 의식해서 채워야 합니다. 쉬는 시간, 기록하는 습관, 사람에게 묻는 일처럼 ` +
      `평소라면 건너뛸 것들을 일부러 일정에 넣어두면 균형이 잡힙니다.`,
  );

  return lines.join(" ");
}

function love(f: Facts, name: string): string {
  const star = f.spouseStar;
  const lines = [
    `연애와 결혼은 ${star}(${GROUP_MEANING[star]})을 배우자성으로 봅니다. ` +
      `${name}님은 이 기운이 ${f.spouseCount}개로 ${level(f.spouseCount)} 수준입니다.`,
  ];

  if (f.spouseCount === 0) {
    lines.push(
      `원국에 배우자성이 없다는 건 인연이 없다는 뜻이 아니라, 관계가 저절로 굴러오지는 않는다는 뜻입니다. ` +
        `먼저 다가가거나 주변의 소개를 통해 만나는 쪽이 자연스럽습니다.`,
    );
  } else if (f.spouseCount >= 4) {
    lines.push(
      `배우자성이 많으면 인연의 폭은 넓지만 한 사람에게 정착하기까지 시간이 걸립니다. ` +
        `선택지를 늘리기보다 기준을 좁히는 편이 결과가 낫습니다.`,
    );
  }

  if (f.dayClash) {
    lines.push(
      `일지(日支)에 충(沖)이 걸려 있습니다. 일지는 배우자가 앉는 자리라, 관계에 변동이 잦은 구조로 봅니다. ` +
        `한 번 어긋나면 대화로 봉합하기보다 거리를 두는 쪽을 택하기 쉬우니, 감정이 올라온 날은 결론을 미루세요.`,
    );
  } else if (f.dayHarmony) {
    lines.push(
      `일지에 합(合)이 들어 있습니다. 배우자 자리가 다른 글자와 끌어당기는 관계라, ` +
        `한번 맺은 인연이 길게 이어지는 편입니다. 다만 너무 붙어 있으면 서로의 영역이 사라지니 각자의 시간을 지켜주세요.`,
    );
  }

  if (f.hasDohwa) {
    lines.push(
      `도화(桃花)가 있습니다. 사람을 끌어당기는 매력이 있어 관계의 시작이 어렵지 않습니다. ` +
        `매력 자체는 좋은 것이고, 관계 밖의 접점이 자주 생기므로 선을 분명히 하는 관리가 필요할 뿐입니다.`,
    );
  }

  lines.push(
    `${name}님에게 맞는 방식은 감정의 온도보다 ${
      f.counts.관성 >= 2 ? "약속과 형식을 분명히 하는 것" : "반복되는 행동에서 신뢰를 확인하는 것"
    }입니다. 빠른 확신보다 꾸준함이 오래가는 유형입니다.`,
  );

  return lines.join(" ");
}

function career(f: Facts, name: string): string {
  const lines = [
    `직업운은 관성(책임과 조직 생활)과 인성(배움과 받쳐주는 힘)을 함께 봅니다. ` +
      `${name}님은 관성 ${f.counts.관성}개, 인성 ${f.counts.인성}개입니다.`,
  ];

  if (f.counts.관성 >= 3) {
    lines.push(
      `관성이 두터워 조직 안에서 자리를 잡는 힘이 강합니다. 책임을 맡을수록 능력이 드러나는 유형이라 ` +
        `직책이 올라갈 때 성과가 같이 올라갑니다. 다만 부담을 혼자 떠안다 지치기 쉬우니 일을 나누는 연습이 필요합니다.`,
    );
  } else if (f.counts.관성 === 0) {
    lines.push(
      `관성이 없어 정해진 틀보다 스스로 만든 방식이 맞습니다. 전문직, 기술직, 1인 사업처럼 ` +
        `재량이 큰 자리에서 오래갑니다. 반대로 위계가 강한 조직에서는 버티는 것 자체가 소모입니다.`,
    );
  }

  if (f.counts.식상 >= 3) {
    lines.push(
      `식상이 많아 만들고 표현하는 일에서 성과가 납니다. 기획, 콘텐츠, 교육, 영업처럼 ` +
        `결과물이 밖으로 드러나는 분야가 유리합니다.`,
    );
  }
  if (f.counts.인성 >= 3) {
    lines.push(`인성이 두터워 자격증, 학위, 문서로 증명되는 경로에서 인정받기 쉽습니다.`);
  }

  if (f.hasYeokma) {
    lines.push(
      `역마(驛馬)가 있습니다. 한곳에 머무는 일보다 이동, 출장, 해외, 여러 현장을 오가는 일이 체질에 맞습니다.`,
    );
  }

  lines.push(
    `강한 ${josa(f.strongest, "을/를")} 살리는 자리를 고르세요. ` +
      `올해는 한 번에 큰 전환을 하기보다 지금 하는 일을 눈에 보이는 결과물로 정리할 때 다음 기회가 열립니다.`,
  );

  return lines.join(" ");
}

function wealth(f: Facts, name: string): string {
  const lines = [
    `재물은 재성(돈과 현실 감각)으로 봅니다. ${name}님은 재성이 ${f.counts.재성}개로 ${level(f.counts.재성)} 수준이고, ` +
      `경쟁과 분배를 뜻하는 비겁은 ${f.counts.비겁}개입니다.`,
  ];

  if (f.counts.재성 === 0) {
    lines.push(
      `재성이 원국에 없습니다. 돈을 못 번다는 뜻이 아니라, 돈이 저절로 모이는 구조는 아니라는 뜻입니다. ` +
        `자동이체처럼 "손대지 않아도 쌓이는 장치"를 만들어두는 쪽이 의지로 모으는 것보다 훨씬 효과적입니다.`,
    );
  } else if (f.counts.재성 >= 4) {
    lines.push(
      `재성이 많습니다. 돈이 들어오는 길은 여러 갈래지만 나가는 길도 그만큼 많습니다. ` +
        `수입을 늘리는 것보다 지출 항목을 줄이는 쪽이 잔고에 더 크게 남습니다.`,
    );
  }

  if (f.counts.비겁 >= 3 && f.counts.재성 > 0) {
    lines.push(
      `비겁이 ${f.counts.비겁}개로 재성보다 두텁습니다. 내 몫이 남에게 흘러가기 쉬운 구조라, ` +
        `동업과 금전 거래에서 손실이 생기기 쉽습니다. 금액은 반드시 문서로 남기고, 보증은 피하세요.`,
    );
  }

  if (f.counts.식상 >= 2 && f.counts.재성 >= 2) {
    lines.push(
      `식상과 재성이 함께 있어 "만들어서 파는" 흐름이 열려 있습니다. ` +
        `내 손에서 나온 것을 돈으로 바꾸는 방식이 월급보다 잘 맞을 수 있습니다.`,
    );
  }

  lines.push(
    `큰 한 방보다 구조를 만드는 쪽이 맞습니다. 고정비와 투자성 지출을 나눠 관리하면 새는 돈이 먼저 보입니다.`,
  );

  return lines.join(" ");
}

function health(f: Facts, name: string): string {
  const ORGAN: Record<string, string> = {
    "목(木)": "간과 담, 그리고 근육·눈",
    "화(火)": "심장과 소장, 그리고 혈압·수면",
    "토(土)": "위장과 비장, 그리고 소화",
    "금(金)": "폐와 대장, 그리고 호흡기·피부",
    "수(水)": "신장과 방광, 그리고 허리·생식기",
  };

  const weakOrgan = ORGAN[f.weakest] ?? "약한 기운에 해당하는 부위";
  const strongOrgan = ORGAN[f.strongest] ?? "";

  const lines = [
    `건강은 오행의 치우침으로 봅니다. ${name}님은 ${josa(f.weakest, "이/가")} 가장 약합니다. ` +
      `전통적으로 ${f.weakest} 기운은 ${weakOrgan}과 연결해 보므로, 피로가 쌓이면 이쪽부터 신호가 옵니다.`,
  ];

  if (strongOrgan) {
    lines.push(
      `반대로 ${josa(f.strongest, "은/는")} 과하게 강합니다. 넘치는 기운도 치우침이라, ` +
        `${strongOrgan} 쪽에 무리가 가지 않는지 함께 살피는 편이 좋습니다.`,
    );
  }

  lines.push(
    `관리는 단기 집중보다 매일 같은 시간대의 반복이 잘 맞습니다. 수면 시각을 고정하는 것 하나만으로도 ` +
      `${name}님 사주에서는 체감이 큽니다.`,
  );

  lines.push(
    `※ 사주는 몸의 경향을 보는 참고 자료입니다. 증상이 있다면 반드시 의료기관에서 진단받으세요.`,
  );

  return lines.join(" ");
}

function yearly(f: Facts, name: string): string {
  const year = new Date().getFullYear();
  const sipsin = f.yearSipsin;

  const BY_SIPSIN: Record<string, string> = {
    비겁: "경쟁자와 동료가 동시에 늘어납니다. 혼자 안고 가기보다 사람을 쓰되, 내 몫의 경계는 분명히 하세요.",
    식상: "표현하고 벌이기 좋은 해입니다. 새로 시작한 것이 반응을 얻기 쉬우니 작게라도 밖으로 내보내세요.",
    재성: "돈이 오가는 일이 많아집니다. 기회도 지출도 함께 커지니 들어온 만큼 남기는 관리가 핵심입니다.",
    관성: "책임이 무거워지는 해입니다. 자리가 올라가거나 일이 늘어납니다. 버티면 평판이 쌓입니다.",
    인성: "배우고 정리하기 좋은 해입니다. 확장보다 내실을 다질 때 다음 단계가 열립니다.",
  };

  const group = (Object.keys(BY_SIPSIN) as string[]).find((g) => sipsin.includes(g.slice(0, 1)))
    ?? "인성";

  const lines = [
    `${year}년의 간지는 ${f.yearGanzi}이고, ${name}님의 일간 기준으로는 ${sipsin}에 해당합니다.`,
    BY_SIPSIN[group] ?? BY_SIPSIN["인성"],
  ];

  if (f.clashCount > 0) {
    lines.push(
      `원국에 충(沖)이 ${f.clashCount}곳 있습니다. 변동이 생기는 해에는 이 자리가 먼저 흔들리니, ` +
        `이사·이직·큰 계약은 서두르지 말고 한 달 미뤄 보고 결정하세요.`,
    );
  }

  lines.push(`월별 흐름은 아래 '월별 운세'에서 열두 달을 하나씩 짚어 두었습니다.`);

  return lines.join(" ");
}

function tenGods(f: Facts, name: string): string {
  const order: SipsinGroup[] = ["비겁", "식상", "재성", "관성", "인성"];
  const detail = order
    .map((g) => `${g}(${GROUP_MEANING[g]}) ${f.counts[g]}개`)
    .join(" · ");

  const top = topGroup(f.counts);
  const empty = emptyGroups(f.counts);

  const lines = [
    `십신은 '나'를 기준으로 나머지 글자들이 어떤 역할인지 다섯 가지로 나눈 것입니다. ` +
      `${name}님의 분포는 이렇습니다 — ${detail}.`,
    `가장 두터운 ${top}(${GROUP_MEANING[top]})이 삶의 중심축입니다. ` +
      `선택의 순간마다 이 기운이 먼저 작동하므로, 잘 쓰면 가장 큰 무기이고 과하면 같은 실수를 반복하게 만듭니다.`,
  ];

  if (empty.length > 0) {
    lines.push(
      `비어 있는 ${empty.join(", ")}은 타고난 각본에 없는 영역입니다. ` +
        `그래서 이 분야에서는 재능보다 습관으로 승부해야 합니다. 의식적으로 일정에 넣지 않으면 평생 건드리지 않게 됩니다.`,
    );
  }

  return lines.join(" ");
}

function majorCycles(f: Facts, name: string): string {
  const dw = f.currentDaewoon;
  if (!dw) {
    return (
      `대운은 10년 단위로 바뀌는 큰 흐름입니다. 날씨로 치면 계절에 해당해서, ` +
      `같은 선택도 어느 대운에 하느냐에 따라 결과가 달라집니다. ` +
      `${name}님의 출생 정보로는 현재 대운을 특정하기 어려워, 월별 흐름을 중심으로 보시는 편이 정확합니다.`
    );
  }

  return [
    `대운은 10년씩 바뀌는 큰 흐름입니다. ${name}님은 현재 ${f.currentAge}세로 ` +
      `${dw.age}세부터 시작된 ${dw.ganzi} 대운을 지나고 있습니다.`,
    `이 대운은 위쪽 글자가 ${readSipsin(dw.stemSipsin)}, 아래쪽 글자가 ${readSipsin(dw.branchSipsin)}입니다. ` +
      `앞 5년은 위쪽 기운이, 뒤 5년은 아래쪽 기운이 더 크게 작용한다고 봅니다.`,
    `기운의 세기로는 ${readUnseong(dw.unseong)}에 해당합니다. ` +
      `힘이 오르는 구간이면 밀어붙여도 되고, 내려가는 구간이면 지키는 쪽이 유리합니다.`,
    `${dw.age + 10}세에 다음 대운으로 넘어갑니다. 큰 결정은 대운이 바뀌는 해를 피해 ` +
      `앞뒤로 1~2년 여유를 두는 편이 안전합니다.`,
  ].join(" ");
}

function relationship(f: Facts, name: string): string {
  const lines = [
    `대인관계는 비겁(자기 주장과 경쟁)과 관성(책임과 조직 생활)의 균형으로 봅니다. ` +
      `${name}님은 비겁 ${f.counts.비겁}개, 관성 ${f.counts.관성}개입니다.`,
  ];

  if (f.counts.비겁 > f.counts.관성) {
    lines.push(
      `비겁이 관성보다 많아 내 기준이 먼저 서는 편입니다. 리더 역할은 잘 맞지만 ` +
        `위에서 누르는 구조에서는 마찰이 생깁니다. 반대 의견을 끝까지 들어보는 것만으로 평판이 달라집니다.`,
    );
  } else if (f.counts.관성 > f.counts.비겁) {
    lines.push(
      `관성이 비겁보다 많아 주변 기대에 맞추는 힘이 강합니다. 신뢰는 쌓이지만 ` +
        `거절을 못해 일이 몰립니다. "지금은 어렵다"는 말을 연습해 두세요.`,
    );
  } else {
    lines.push(`두 기운이 비슷해 상황에 따라 앞에 서기도 하고 받쳐주기도 하는 편입니다.`);
  }

  if (f.harmonyCount >= 2) {
    lines.push(`원국에 합(合)이 ${f.harmonyCount}곳 있어 사람이 잘 붙습니다. 소개와 모임에서 기회가 옵니다.`);
  }
  if (f.clashCount >= 2) {
    lines.push(
      `충(沖)이 ${f.clashCount}곳으로 많습니다. 가까운 사이일수록 부딪히기 쉬우니 ` +
        `감정이 올라온 자리에서는 결론을 내지 말고 하루 뒤에 말하세요.`,
    );
  }

  lines.push(`말의 세기보다 일관성이 신뢰를 만듭니다. 작게 약속하고 정확히 지키는 방식이 ${name}님에게 가장 잘 맞습니다.`);

  return lines.join(" ");
}

function actionAdvice(f: Facts, name: string, luckyColor: string): string {
  const empty = emptyGroups(f.counts);
  const items: string[] = [];

  items.push(`부족한 ${josa(f.weakest, "을/를")} 채우는 습관을 하나만 정해 이번 주에 시작하세요.`);

  if (f.counts.비겁 >= 3) items.push(`이번 달에 남의 의견을 끝까지 들어본 자리를 한 번 만드세요.`);
  if (f.counts.인성 >= 3) items.push(`준비가 70% 됐을 때 일단 시작해 보세요. 나머지는 하면서 채워집니다.`);
  if (f.counts.재성 === 0) items.push(`월급날 자동이체로 빠져나가는 저축 계좌를 하나 만드세요.`);
  if (f.counts.관성 === 0) items.push(`스스로 마감일을 정해 남에게 알려두세요. 외부의 틀이 없으면 느슨해집니다.`);
  if (f.clashCount > 0) items.push(`중요한 결정은 감정이 가라앉은 다음 날로 미루세요.`);
  if (empty.length > 0) items.push(`비어 있는 ${empty.join(", ")} 영역은 일정표에 넣지 않으면 평생 건드리지 않습니다.`);

  items.push(`행운색 ${josa(luckyColor, "을/를")} 자주 쓰는 물건이나 옷차림에 작게 넣어보세요.`);

  const picked = items.slice(0, 4);
  return (
    `${name}님이 지금 바로 할 수 있는 것들입니다.\n\n` +
    picked.map((t, i) => `${i + 1}. ${t}`).join("\n")
  );
}

function summary(f: Facts, name: string): string {
  const top = topGroup(f.counts);
  return (
    `${name}님의 핵심은 강한 ${josa(f.strongest, "을/를")} 현실적인 습관으로 연결하는 것입니다. ` +
    `${top}(${GROUP_MEANING[top]})이 중심축이라 이 방향으로 쌓은 것은 오래 남고, ` +
    `부족한 ${josa(f.weakest, "은/는")} 의식해서 채워야 비로소 균형이 잡힙니다. ` +
    `사주는 정해진 결말이 아니라 타고난 조건입니다. 조건을 알고 쓰는 사람과 모르고 부딪히는 사람의 차이가 결과를 만듭니다.`
  );
}

function closing(name: string): string {
  return (
    `여기까지가 ${name}님의 사주 원국에서 읽어낸 내용입니다. ` +
    `모든 해석은 입력하신 생년월일시로 계산한 만세력과 십신·합충·대운을 근거로 했습니다. ` +
    `읽고 나서 "맞다" 싶은 부분부터 한 가지만 실천해 보세요. 사주는 알고 나서 쓰는 것이 전부입니다.`
  );
}

// ──────────────────────────────────────────────
// 바깥에서 쓰는 함수
// ──────────────────────────────────────────────

export interface ReportSections {
  overview: string;
  personality: string;
  love: string;
  career: string;
  wealth: string;
  health: string;
  yearlyFortune: string;
  tenGods: string;
  majorCycles: string;
  relationship: string;
  actionAdvice: string;
  summary: string;
  closingMessage: string;
}

/**
 * 사주 원국에서 결과지 본문을 만든다.
 * AI 호출 없음. 같은 입력이면 같은 결과.
 */
export function buildReportSections(
  input: CategoryAnalysisInput,
  luckyColor: string,
): ReportSections | null {
  let f: Facts;
  try {
    f = collectFacts(input);
  } catch {
    return null; // 간지 계산이 안 되면 기존 방식으로 넘긴다
  }

  if (!DAY_STEM_TRAIT[f.dayStem]) return null;

  const name = input.name;

  return {
    overview: overview(f, name),
    personality: personality(f, name),
    love: love(f, name),
    career: career(f, name),
    wealth: wealth(f, name),
    health: health(f, name),
    yearlyFortune: yearly(f, name),
    tenGods: tenGods(f, name),
    majorCycles: majorCycles(f, name),
    relationship: relationship(f, name),
    actionAdvice: actionAdvice(f, name, luckyColor),
    summary: summary(f, name),
    closingMessage: closing(name),
  };
}
