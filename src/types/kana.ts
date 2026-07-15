export type ScriptId = "hiragana" | "katakana";

export type RowId =
  | "vowel"
  | "k"
  | "s"
  | "t"
  | "n"
  | "h"
  | "m"
  | "y"
  | "r"
  | "w"
  | "dakuten"
  | "handakuten"
  | "combo";

export interface KanaCharacter {
  /** Unique id, e.g. "hira-ka" */
  id: string;
  script: ScriptId;
  row: RowId;
  /** The kana glyph itself, e.g. "あ" */
  char: string;
  /** Romanized reading, e.g. "a" */
  romaji: string;
  /** A short example word using the character. */
  example: {
    word: string;
    romaji: string;
    meaning: string;
  };
  notes?: string;
}

export type ResourcePack = {
  id: string;
  script: ScriptId;
  version: string;
  characters: KanaCharacter[];
};

export const ROW_LABELS: Record<RowId, string> = {
  vowel: "Vowels",
  k: "Ka-row",
  s: "Sa-row",
  t: "Ta-row",
  n: "Na-row",
  h: "Ha-row",
  m: "Ma-row",
  y: "Ya-row",
  r: "Ra-row",
  w: "Wa-row",
  dakuten: "Dakuten (゛)",
  handakuten: "Handakuten (゜)",
  combo: "Combinations (拗音)",
};
