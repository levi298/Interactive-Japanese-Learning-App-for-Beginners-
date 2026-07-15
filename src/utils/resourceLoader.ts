import type { ResourcePack, KanaCharacter, ScriptId } from "../types/kana";

const cache = new Map<ScriptId, KanaCharacter[]>();

/**
 * Loads a kana resource pack (e.g. resources/hiragana.json) at runtime.
 * New packs can be dropped into /public/resources and registered in
 * manifest.json without touching this function or any application code.
 */
export async function loadKanaPack(script: ScriptId): Promise<KanaCharacter[]> {
  if (cache.has(script)) return cache.get(script)!;
  const res = await fetch(`./resources/${script}.json`);
  if (!res.ok) throw new Error(`Failed to load resource pack: ${script}`);
  const pack: ResourcePack = await res.json();
  cache.set(script, pack.characters);
  return pack.characters;
}

export async function loadAllKana(): Promise<KanaCharacter[]> {
  const [hira, kata] = await Promise.all([loadKanaPack("hiragana"), loadKanaPack("katakana")]);
  return [...hira, ...kata];
}
