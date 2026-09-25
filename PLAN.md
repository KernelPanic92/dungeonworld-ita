
## Materiali -> design (settembre 2026) — 2966c05
- [x] Root `materiali` rinominata in `design` (git mv): qui vivono i sorgenti dei designer (indd/pdf/jpg)
- [x] Schema materials: asset file usa `fields.pathReference` verso `design/**` (niente PDF nella entry); thumbnail resta `fields.file` (entry-dir)
- [x] Route /files: mappa URL root -> dir repo (materiali→docs/materiali, manuale→docs/manuale, design→design); traversal bloccata
- [x] Download materiali: href = /files/{path-design}
- [x] Migrazione scripts/migrate-design-assets.ts: mappatura materiale → file design (52 PDF rimossi da docs/materiali, guida spostata in design/community)
