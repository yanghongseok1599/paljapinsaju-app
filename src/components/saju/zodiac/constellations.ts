/**
 * Stylized constellation point coordinates for each zodiac sign.
 * viewBox is 100×100; (50,50) is the center.
 *
 * `stars` = array of [x, y] points.
 * `lines` = pairs of star indices [a, b] indicating which stars to connect.
 *
 * Shapes are stylized impressions (not astronomically accurate) — picked so
 * each sign reads as visually distinct on hover.
 */
export type Constellation = {
  stars: Array<[number, number]>;
  lines: Array<[number, number]>;
};

export const CONSTELLATIONS: Record<string, Constellation> = {
  // ♈ Aries — ram's horns (W pointing up)
  aries: {
    stars: [[22, 30], [35, 58], [50, 78], [65, 58], [78, 30]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  // ♉ Taurus — V (bull's head + horns)
  taurus: {
    stars: [[22, 28], [50, 60], [78, 28], [40, 78], [60, 78]],
    lines: [[0, 1], [1, 2], [1, 3], [1, 4]],
  },
  // ♊ Gemini — twin pillars
  gemini: {
    stars: [[32, 22], [32, 78], [68, 22], [68, 78]],
    lines: [[0, 1], [2, 3], [0, 2], [1, 3]],
  },
  // ♋ Cancer — C / claws
  cancer: {
    stars: [[72, 28], [42, 30], [30, 52], [42, 74], [72, 76]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  // ♌ Leo — sickle (head + body)
  leo: {
    stars: [[24, 30], [42, 22], [60, 32], [72, 52], [64, 74], [40, 80]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  },
  // ♍ Virgo — M with descender
  virgo: {
    stars: [[20, 76], [30, 28], [45, 54], [55, 28], [70, 76], [62, 88]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  },
  // ♎ Libra — balance scale
  libra: {
    stars: [[50, 82], [50, 50], [25, 50], [75, 50], [30, 32], [70, 32]],
    lines: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 5]],
  },
  // ♏ Scorpio — S-curve tail
  scorpio: {
    stars: [[20, 70], [38, 55], [55, 40], [72, 32], [82, 48], [70, 60]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  },
  // ♐ Sagittarius — drawn bow / arrow
  sagittarius: {
    stars: [[24, 28], [48, 52], [72, 76], [82, 62], [70, 80]],
    lines: [[0, 1], [1, 2], [2, 3], [2, 4]],
  },
  // ♑ Capricorn — V with curled tail
  capricorn: {
    stars: [[22, 28], [50, 78], [78, 28], [82, 52], [70, 64]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  // ♒ Aquarius — water waves (two parallel waves)
  aquarius: {
    stars: [[20, 38], [38, 28], [56, 38], [74, 28], [82, 38], [20, 64], [38, 54], [56, 64], [74, 54], [82, 64]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [5, 6], [6, 7], [7, 8], [8, 9]],
  },
  // ♓ Pisces — two fish tied by a cord
  pisces: {
    stars: [[20, 32], [34, 50], [22, 68], [50, 50], [78, 32], [66, 50], [78, 68]],
    lines: [[0, 1], [1, 2], [1, 3], [3, 5], [4, 5], [5, 6]],
  },
};
