// noinspection NonAsciiCharacters,JSNonASCIINames
const BASE_ROMAN_TO_UNICODE: { [k in string]: number } = {
  ṃ: 1,
  ṁ: 2,
  ḥ: 3,
  a: 5,
  ā: 6,
  i: 7,
  ī: 8,
  u: 9,
  ū: 10,
  ṛ: 11,
  ḽ: 12,
  e: 14,
  ē: 15,
  aʸ: 16,
  o: 18,
  ō: 19,
  aʷ: 20,
  k: 21,
  kʰ: 22,
  g: 23,
  gʰ: 24,
  ṅ: 25,
  c: 26,
  cʰ: 27,
  j: 28,
  jʰ: 29,
  ñ: 30,
  ṭ: 31,
  ṭʰ: 32,
  ḍ: 33,
  ḍʰ: 34,
  ṇ: 35,
  t: 36,
  tʰ: 37,
  d: 38,
  dʰ: 39,
  n: 40,
  p: 42,
  pʰ: 43,
  b: 44,
  bʰ: 45,
  m: 46,
  y: 47,
  r: 48,
  ṟ: 49,
  l: 50,
  ḷ: 51,
  ʋ: 53,
  š: 54,
  ṣ: 55,
  s: 56,
  h: 57,
  q: 77,
};

export const UNICODE_BLOCKS = {
  devanagari: 0x900,
  telugu: 0xc00,
  gujarati: 0xa80,
  bengali: 0x980,
};

// noinspection NonAsciiCharacters,JSNonASCIINames
const MATRAS: { [k in string]: number } = {
  a: -1,
  ā: 62,
  i: 63,
  ī: 64,
  u: 65,
  ū: 66,
  ṛ: 67,
  ṝ: 68,
  e: 70,
  ē: 71,
  aʸ: 72,
  o: 74,
  ō: 75,
  aʷ: 76,
  ḽ: 98,
};

const HALANT = 77;

function isConsonant(ch: string): boolean {
  const u = BASE_ROMAN_TO_UNICODE[ch];
  return u === 1 || (u >= 21 && u <= 57);
}

export function roman2unicode(
  input: string | undefined,
  block: number
): string {
  if (!input || input.length === 0) return "";

  let idx = 0;
  const len = input.length;
  const output: (string | number)[] = [];
  let prev = "";

  while (idx < len) {
    for (let i = 2; i > 0; i--) {
      const s = input.substr(idx, i);
      const u = BASE_ROMAN_TO_UNICODE[s];
      const nextIdx = idx + s.length;
      const nextU =
        nextIdx < len ? BASE_ROMAN_TO_UNICODE[input[nextIdx]] : undefined;
      let found = false;

      if (isConsonant(prev)) {
        if (isConsonant(s)) {
          output.push(HALANT);
          output.push(u);
          found = true;
        } else if (MATRAS[s]) {
          if (MATRAS[s] > 0) output.push(MATRAS[s]);
          found = true;
        } else if ([1, 2, 3, 4].includes(u)) {
          output.push(u);
          found = true;
        }
      } else if (u !== undefined) {
        output.push(u);
        if (s === "q") output.push(String.fromCharCode(0x200c));
        found = true;
      }

      if (isConsonant(s) && u > 4 && (nextIdx >= len || nextU === undefined))
        output.push(HALANT);

      if (found) {
        idx += s.length;
        prev = s;
        break;
      } else if (i === 1) {
        prev = s;
        output.push(s);
        idx++;
      }
    }
  }

  return output
    .map((x) => (typeof x === "number" ? String.fromCharCode(x + block) : x))
    .join("");
}
