/**
 * 한국어 조사 자동 선택.
 *
 * 템플릿에 조사를 고정해두면 "정리으로", "레드을" 처럼 틀린 문장이 나온다.
 * 읽는 사람은 바로 알아채고, 기계가 쓴 글처럼 느껴진다.
 * 앞 글자의 받침 유무를 보고 맞는 조사를 고른다.
 */

/**
 * 조사를 붙일 기준이 되는 마지막 한글 글자를 찾는다.
 *
 * "금(金)" 처럼 한자나 괄호가 뒤에 붙는 경우가 많다. 그대로 마지막 글자를 보면
 * ')' 가 잡혀서 "금(金)가" 같은 틀린 조사가 나온다.
 * 그래서 뒤에서부터 훑어 처음 만나는 한글 음절을 기준으로 삼는다.
 */
function lastHangulCode(word: string): number | null {
  for (let i = word.trim().length - 1; i >= 0; i--) {
    const code = word.trim().charCodeAt(i);
    if (code >= 0xac00 && code <= 0xd7a3) return code;
  }
  return null;
}

/** 마지막 한글 글자에 받침이 있는지 */
function hasBatchim(word: string): boolean {
  const code = lastHangulCode(word);
  if (code === null) return false;
  return (code - 0xac00) % 28 !== 0;
}

type JosaPair = "을/를" | "은/는" | "이/가" | "과/와" | "으로/로" | "이라/라";

const PAIRS: Record<JosaPair, [string, string]> = {
  "을/를": ["을", "를"],
  "은/는": ["은", "는"],
  "이/가": ["이", "가"],
  "과/와": ["과", "와"],
  "으로/로": ["으로", "로"],
  "이라/라": ["이라", "라"],
};

/**
 * 단어에 맞는 조사를 붙여 돌려준다.
 *
 *   josa("정리", "을/를")   → "정리를"
 *   josa("추진", "을/를")   → "추진을"
 *   josa("레드", "으로/로") → "레드로"
 *
 * 'ㄹ' 받침은 '으로/로'에서 예외다 ("서울로", "유연성으로").
 */
export function josa(word: string, pair: JosaPair): string {
  const [withBatchim, withoutBatchim] = PAIRS[pair];
  const code = lastHangulCode(word);
  const jong = code === null ? 0 : (code - 0xac00) % 28;

  // ㄹ(8) 받침은 '로'를 쓴다
  if (pair === "으로/로" && jong === 8) return word + withoutBatchim;

  return word + (hasBatchim(word) ? withBatchim : withoutBatchim);
}
