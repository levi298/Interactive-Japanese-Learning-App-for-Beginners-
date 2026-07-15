import { useEffect, useState } from "react";
import type { KanaCharacter, ScriptId } from "../types/kana";
import { loadKanaPack } from "../utils/resourceLoader";

export function useKanaData(script: ScriptId) {
  const [characters, setCharacters] = useState<KanaCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadKanaPack(script)
      .then((chars) => {
        if (!cancelled) setCharacters(chars);
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [script]);

  return { characters, loading, error };
}

export function useAllKanaData() {
  const hira = useKanaData("hiragana");
  const kata = useKanaData("katakana");
  return {
    hiragana: hira.characters,
    katakana: kata.characters,
    all: [...hira.characters, ...kata.characters],
    loading: hira.loading || kata.loading,
  };
}
