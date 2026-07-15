# Future resource packs

Drop new JSON packs here (e.g. `kanji.json`, `vocabulary.json`, `grammar.json`)
and register them in `../manifest.json`. The app reads packs dynamically at
runtime via `resourceLoader.ts` — no application code changes are required
to add a new pack, only a new module/page to present it if it introduces a
new content type.
