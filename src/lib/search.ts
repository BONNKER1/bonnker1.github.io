/**
 * Клиентский поиск по каталогу: кириллица → латиница и фонетическое свёртывание,
 * чтобы «камри» находило Camry, «солярис» — Solaris, «шкода» — Skoda.
 */

const translitMap: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export const fold = (value: string): string =>
  value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/дж/g, 'j')
    .replace(/[а-я]/g, (char) => translitMap[char] ?? char)
    .replace(/sch|sh/g, 's')
    .replace(/c/g, 'k')
    .replace(/y/g, 'i')
    .replace(/w/g, 'v');

export const tokenize = (value: string): string[] =>
  fold(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);

const editDistance = (a: string, b: string): number => {
  const dp = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return dp[b.length];
};

export const isClose = (needle: string, token: string): boolean => {
  if (token === needle || token.startsWith(needle)) return true;
  // Цифры (годы, индексы моделей) сравниваем только точно: 2107 ≠ 2109.
  if (/^\d+$/.test(needle)) return false;
  const allowed = needle.length >= 7 ? 2 : needle.length >= 4 ? 1 : 0;
  return allowed > 0 && editDistance(needle, token) <= allowed;
};

/** Все слова запроса должны найтись в тексте (с учётом опечаток). */
export function matchesQuery(query: string, text: string, folded: string, tokens: string[]): boolean {
  const raw = query.trim().toLowerCase();
  if (!raw) return true;
  if (text.includes(raw)) return true;

  const needles = tokenize(raw);
  return needles.every(
    (needle) => isClose(needle, folded) || tokens.some((token) => isClose(needle, token)),
  );
}
