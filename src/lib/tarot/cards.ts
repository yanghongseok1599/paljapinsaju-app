/**
 * 타로 카드 데이터 (라이더-웨이트 78장)
 * 정/역방향 키워드는 한국어 기준 3-5개. 다국어 카드명은 messages/{locale}.json TarotCards namespace 참조.
 */

import type { SpreadType } from './spreads';
import { SPREADS } from './spreads';

export type TarotArcana = 'major' | 'minor';
export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles';

export interface TarotCard {
  id: string;
  arcana: TarotArcana;
  suit?: TarotSuit;
  number: number | string;
  nameEn: string;
  image: string;
  keywords: {
    upright: string[];
    reversed: string[];
  };
}

export interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
  position: string;
}

// ─── Major Arcana (22장) ─────────────────────────────────────
const MAJOR: TarotCard[] = [
  { id: 'major-00', arcana: 'major', number: 0,  nameEn: 'The Fool',           image: '/tarot/cards/major/00-fool.webp',          keywords: { upright: ['새로운 시작', '순수', '도약', '자유'],            reversed: ['무모함', '망설임', '준비 부족'] } },
  { id: 'major-01', arcana: 'major', number: 1,  nameEn: 'The Magician',       image: '/tarot/cards/major/01-magician.webp',      keywords: { upright: ['의지', '창조', '자원 활용', '집중'],              reversed: ['속임수', '재능 낭비', '계획 부재'] } },
  { id: 'major-02', arcana: 'major', number: 2,  nameEn: 'The High Priestess', image: '/tarot/cards/major/02-high-priestess.webp', keywords: { upright: ['직관', '내면의 지혜', '비밀', '신비'],            reversed: ['직관 무시', '숨겨진 동기', '단절'] } },
  { id: 'major-03', arcana: 'major', number: 3,  nameEn: 'The Empress',        image: '/tarot/cards/major/03-empress.webp',       keywords: { upright: ['풍요', '모성', '창조성', '자연'],                 reversed: ['의존', '창조 막힘', '결핍'] } },
  { id: 'major-04', arcana: 'major', number: 4,  nameEn: 'The Emperor',        image: '/tarot/cards/major/04-emperor.webp',       keywords: { upright: ['권위', '구조', '안정', '리더십'],                 reversed: ['지나친 통제', '독선', '경직'] } },
  { id: 'major-05', arcana: 'major', number: 5,  nameEn: 'The Hierophant',     image: '/tarot/cards/major/05-hierophant.webp',    keywords: { upright: ['전통', '교육', '도덕', '인습'],                   reversed: ['반항', '자유로움', '새로운 길'] } },
  { id: 'major-06', arcana: 'major', number: 6,  nameEn: 'The Lovers',         image: '/tarot/cards/major/06-lovers.webp',        keywords: { upright: ['사랑', '조화', '선택', '결합'],                   reversed: ['불화', '잘못된 선택', '단절'] } },
  { id: 'major-07', arcana: 'major', number: 7,  nameEn: 'The Chariot',        image: '/tarot/cards/major/07-chariot.webp',       keywords: { upright: ['승리', '의지', '추진력', '통제'],                 reversed: ['방향 상실', '무력감', '내적 갈등'] } },
  { id: 'major-08', arcana: 'major', number: 8,  nameEn: 'Strength',           image: '/tarot/cards/major/08-strength.webp',      keywords: { upright: ['내적 힘', '용기', '인내', '온화함'],              reversed: ['자기 의심', '약함', '감정 폭주'] } },
  { id: 'major-09', arcana: 'major', number: 9,  nameEn: 'The Hermit',         image: '/tarot/cards/major/09-hermit.webp',        keywords: { upright: ['성찰', '내면 탐구', '고독', '지혜'],              reversed: ['고립', '회피', '외로움'] } },
  { id: 'major-10', arcana: 'major', number: 10, nameEn: 'Wheel of Fortune',   image: '/tarot/cards/major/10-wheel.webp',         keywords: { upright: ['전환점', '운명', '순환', '기회'],                 reversed: ['불운', '저항', '정체'] } },
  { id: 'major-11', arcana: 'major', number: 11, nameEn: 'Justice',            image: '/tarot/cards/major/11-justice.webp',       keywords: { upright: ['정의', '균형', '인과', '진실'],                   reversed: ['불공정', '편향', '책임 회피'] } },
  { id: 'major-12', arcana: 'major', number: 12, nameEn: 'The Hanged Man',     image: '/tarot/cards/major/12-hanged-man.webp',    keywords: { upright: ['관점 전환', '내려놓음', '대기', '깨달음'],        reversed: ['고집', '정체', '희생 회피'] } },
  { id: 'major-13', arcana: 'major', number: 13, nameEn: 'Death',              image: '/tarot/cards/major/13-death.webp',         keywords: { upright: ['종결', '변화', '재탄생', '전환'],                 reversed: ['변화 거부', '정체', '두려움'] } },
  { id: 'major-14', arcana: 'major', number: 14, nameEn: 'Temperance',         image: '/tarot/cards/major/14-temperance.webp',    keywords: { upright: ['절제', '조화', '인내', '중용'],                   reversed: ['불균형', '과잉', '조급함'] } },
  { id: 'major-15', arcana: 'major', number: 15, nameEn: 'The Devil',          image: '/tarot/cards/major/15-devil.webp',         keywords: { upright: ['속박', '집착', '유혹', '물질주의'],               reversed: ['해방', '자각', '집착 끊기'] } },
  { id: 'major-16', arcana: 'major', number: 16, nameEn: 'The Tower',          image: '/tarot/cards/major/16-tower.webp',         keywords: { upright: ['붕괴', '갑작스러운 변화', '각성', '해체'],         reversed: ['지연된 위기', '내적 붕괴', '회피'] } },
  { id: 'major-17', arcana: 'major', number: 17, nameEn: 'The Star',           image: '/tarot/cards/major/17-star.webp',          keywords: { upright: ['희망', '영감', '치유', '평온'],                   reversed: ['실망', '믿음 상실', '단절'] } },
  { id: 'major-18', arcana: 'major', number: 18, nameEn: 'The Moon',           image: '/tarot/cards/major/18-moon.webp',          keywords: { upright: ['무의식', '환상', '불확실', '직관'],               reversed: ['혼란 해소', '진실 드러남', '두려움 극복'] } },
  { id: 'major-19', arcana: 'major', number: 19, nameEn: 'The Sun',            image: '/tarot/cards/major/19-sun.webp',           keywords: { upright: ['기쁨', '성공', '활력', '명료함'],                 reversed: ['낙담', '지연된 기쁨', '과신'] } },
  { id: 'major-20', arcana: 'major', number: 20, nameEn: 'Judgement',          image: '/tarot/cards/major/20-judgement.webp',     keywords: { upright: ['부활', '소명', '재평가', '용서'],                 reversed: ['자기 비판', '미루기', '결단 회피'] } },
  { id: 'major-21', arcana: 'major', number: 21, nameEn: 'The World',          image: '/tarot/cards/major/21-world.webp',         keywords: { upright: ['완성', '성취', '통합', '여정의 끝'],              reversed: ['미완성', '지연', '닫히지 않는 장'] } },
];

// ─── Minor Arcana 헬퍼 ──────────────────────────────────────
const RANKS: Array<{ n: number | string; en: string }> = [
  { n: 1,  en: 'Ace' },
  { n: 2,  en: 'Two' },
  { n: 3,  en: 'Three' },
  { n: 4,  en: 'Four' },
  { n: 5,  en: 'Five' },
  { n: 6,  en: 'Six' },
  { n: 7,  en: 'Seven' },
  { n: 8,  en: 'Eight' },
  { n: 9,  en: 'Nine' },
  { n: 10, en: 'Ten' },
  { n: 'page',   en: 'Page' },
  { n: 'knight', en: 'Knight' },
  { n: 'queen',  en: 'Queen' },
  { n: 'king',   en: 'King' },
];

const SUIT_INFO: Record<TarotSuit, { en: string; theme: string[]; reverseTheme: string[] }> = {
  wands: {
    en: 'Wands',
    theme: ['열정', '행동', '창조', '에너지'],
    reverseTheme: ['지연', '소진', '방향 상실'],
  },
  cups: {
    en: 'Cups',
    theme: ['감정', '관계', '직관', '사랑'],
    reverseTheme: ['감정 차단', '오해', '실망'],
  },
  swords: {
    en: 'Swords',
    theme: ['사고', '갈등', '진실', '결단'],
    reverseTheme: ['혼란', '왜곡', '결단 회피'],
  },
  pentacles: {
    en: 'Pentacles',
    theme: ['물질', '안정', '성장', '결실'],
    reverseTheme: ['결핍', '집착', '지연'],
  },
};

function rankSlug(n: number | string): string {
  if (typeof n === 'number') return String(n).padStart(2, '0');
  return n;
}

function buildMinor(suit: TarotSuit): TarotCard[] {
  const info = SUIT_INFO[suit];
  return RANKS.map(({ n, en }) => ({
    id: `${suit}-${rankSlug(n)}`,
    arcana: 'minor' as TarotArcana,
    suit,
    number: n,
    nameEn: `${en} of ${info.en}`,
    image: `/tarot/cards/minor/${suit}/${rankSlug(n)}.webp`,
    keywords: {
      upright: info.theme.slice(),
      reversed: info.reverseTheme.slice(),
    },
  }));
}

const MINOR: TarotCard[] = [
  ...buildMinor('wands'),
  ...buildMinor('cups'),
  ...buildMinor('swords'),
  ...buildMinor('pentacles'),
];

// ─── Full Deck (78장) ───────────────────────────────────────
export const TAROT_DECK: TarotCard[] = [...MAJOR, ...MINOR];

const DECK_BY_ID = new Map(TAROT_DECK.map((c) => [c.id, c]));

export function getCard(id: string): TarotCard | undefined {
  return DECK_BY_ID.get(id);
}

export function shuffleDeck(seed?: number): TarotCard[] {
  const arr = TAROT_DECK.slice();
  let s = seed ?? Date.now();
  // 시드 기반 Fisher-Yates (mulberry32)
  const rng = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function drawCards(spread: SpreadType, deck?: TarotCard[]): DrawnCard[] {
  const d = deck ?? shuffleDeck();
  const def = SPREADS[spread];
  return def.positions.map((position, i) => {
    const card = d[i];
    const reversed = Math.random() < 0.5;
    return { card, reversed, position };
  });
}

/** 카드 컨텍스트 직렬화 (AI prompt 입력용) */
export function serializeDrawnCards(drawn: DrawnCard[], spread: SpreadType): string {
  const lines = drawn.map((d, i) => {
    const orientation = d.reversed ? '역방향' : '정방향';
    const kws = d.reversed ? d.card.keywords.reversed : d.card.keywords.upright;
    return `[${i + 1}] 포지션: ${d.position} | 카드: ${d.card.nameEn} (${d.card.id}, ${orientation}) | 핵심어: ${kws.join(', ')}`;
  });
  return `스프레드: ${spread}\n${lines.join('\n')}`;
}
