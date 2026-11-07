# CLAUDE.md – Regeln für ancient-india-research

Der vollständige Projektauftrag steht in [docs/prompt.md](docs/prompt.md). Diese Datei enthält die verbindlichen Arbeitsregeln.

## 0. Projektstruktur

```text
chapters/   Kurskapitel (erzählende Essays) je Modul + modules.json (Kursgliederung) – Grundlage für die Kurs-App
export/     Generierter Export für die Kurs-App (npm run export) – nicht von Hand bearbeiten
research/   Forschungsdokumente (Markdown + YAML-Frontmatter), ein Ordner pro Forschungsbereich
data/       Strukturierte Daten (JSON): texts, characters, dynasties, locations, timeline, references, questions, cosmology
docs/       Projektdokumentation: prompt.md, conventions.md, plans/ (später: methodology, roadmap, changelog)
website/    Webanwendung (React/Vite) – liest research/ und data/, enthält selbst keine Inhalte
            website/scripts/: validate.mjs (Datenprüfung), smoke-test.mjs (rendert alle Seiten)
```

- Datenmodell, Felder und Wertelisten: `docs/conventions.md` – bei neuen Feldern dort, in `website/src/content/types.ts` und in `validate.mjs` nachziehen.

- Das zentrale Quellenverzeichnis ist `data/references/` – es gibt keinen separaten `sources/`-Ordner, damit Quellen nicht doppelt gepflegt werden.
- Tagespläne liegen in `docs/plans/JJJJ-MM-TT.md`.

## 1. Wissenschaftliche Regeln (höchste Priorität)

1. **Niemals erfinden:** keine Quellen, Zitate, Versnummern, Daten, Autoren, ISBNs oder URLs. Was nicht verifiziert ist, wird als `unverifiziert` markiert oder weggelassen.
2. **Jede Aussage hat eine Evidenzkategorie** (siehe unten). Gemischte Aussagen werden aufgeteilt.
3. **Überlieferung ≠ Historizität:** Was ein Text erzählt, und ob es historisch geschehen ist, sind zwei getrennte Aussagen mit getrennten Kategorien.
4. **Traditionelle Chronologie ≠ wissenschaftliche Datierung:** Yuga-Daten, traditionelle Daten des Kurukshetra-Kriegs usw. werden immer als `tradition` gekennzeichnet und nie mit archäologischen/philologischen Datierungen vermischt.
5. **Gegenpositionen dokumentieren:** Bei umstrittenen Themen (Datierung der Veden, indo-arische Migration, Sarasvati, astronomische Datierungen des Mahabharata) immer die wichtigsten konkurrierenden Positionen mit Quellen nennen.
6. **Keine rückwärts konstruierten Datierungen:** Astronomische Datierungsversuche nur referieren, mit Methode, Annahmen und Kritik – nie selbst „berechnen“ und als Ergebnis ausgeben.
7. **Übersetzungen kennzeichnen:** Immer angeben, von wem eine Übersetzung stammt. Eigene Übersetzungen als „eigene Arbeitsübersetzung“ markieren. Keine Übersetzung als Originalaussage ausgeben.
8. **Quellenhierarchie:** Primärquellen/kritische Editionen > Fachliteratur (peer-reviewed) > Institutionen > ergänzende Quellen. Blogs/Foren höchstens ergänzend und als `quality: low` markiert.
9. **Religiöse Traditionen respektvoll und korrekt wiedergeben** – weder abwerten noch als historische Tatsache ausgeben.

10. **Szenarien in Kurskapiteln** sind illustrative Darstellungen. Sie müssen als solche gekennzeichnet sein (im Feld `scenario`, das die Website als „Szenario“ markiert), dürfen keine erfundenen Zitate realen Quellen zuschreiben und sollen am Ende sagen, was daran erfunden und was belegt ist. Nacherzählungen von Textstellen nennen die Stelle („Nacherzählt nach …“).

### Evidenzkategorien (feste IDs)

| ID | Bedeutung |
|---|---|
| `primary` | Primärquellenbeleg – direkt im Text nachweisbar |
| `established` | Wissenschaftlich gesichert |
| `hypothesis` | Wissenschaftliche Hypothese |
| `tradition` | Traditionelle Überlieferung |
| `disputed` | Umstritten |
| `unresolved` | Ungeklärt |

## 2. Daten- und Inhaltsregeln

- **Inhalte und Code trennen:** Forschung in `research/` (Markdown + YAML-Frontmatter), strukturierte Daten in `data/` (JSON). Die Website in `website/` liest diese nur, sie enthält keine Forschungsinhalte.
- **Eindeutige IDs:** kebab-case, ASCII, stabil, nie umbenennen (z. B. `rigveda`, `krishna`, `src-jamison-brereton-2014`). Präfixe: `src-` Quellen, `evt-` Ereignisse, `loc-` Orte, `q-` Forschungsfragen.
- **Keine Duplikate:** Vor dem Anlegen einer Quelle/Figur/eines Ortes prüfen, ob die ID oder der Eintrag schon existiert.
- **Querverweise nur über IDs**, nie über Dateipfade oder Titel.
- **Quellenpflicht:** Jedes Forschungsdokument referenziert mindestens eine Quelle aus `data/references/` über `sources: [...]`.
- **Sanskrit:** IAST-Umschrift mit Diakritika (ṛ, ā, ś, ṣ, ṇ …), wo sinnvoll zusätzlich Devanāgarī. UTF-8 überall. Dateinamen und IDs ohne Diakritika.
- **Sprache:** Inhalte auf Deutsch; Fachbegriffe in IAST; Zitate aus englischen Übersetzungen dürfen englisch bleiben.
- **Pflichtfelder** eines Forschungsdokuments: siehe `docs/conventions.md` (12 Punkte aus prompt.md, Abschnitt 3).

## 3. Technische Regeln

- Stack: React + TypeScript + Vite + Tailwind CSS + Lucide Icons. Keine Cloud-Dienste, keine kostenpflichtigen APIs, keine externen Laufzeit-Abhängigkeiten (Fonts/Assets lokal) – die App muss offline laufen.
- Start: `cd website && npm install && npm run dev` → http://localhost:5173
- Vor jedem Commit (in `website/`): `npm run validate`, `npm run test:smoke` und `npm run build` müssen fehlerfrei laufen.
- Der Dev-Server lauscht nur auf 127.0.0.1 (lokal). Windows-Start: `start-website.bat`.
- `.gitignore` basiert auf einer Python-Vorlage; `lib/`, `lib64/`, `build/` sind auf das Repo-Root beschränkt, Node/Vite-Regeln (`node_modules/`, `website/dist/`) sind ergänzt.
- Performance: Daten per `import.meta.glob` laden, Suche clientseitig mit Index; Listen bei großen Datenmengen paginieren/virtualisieren.

## 4. Arbeitsweise

- Bestehende Inhalte nicht unbedacht überschreiben – vorher lesen.
- Qualität vor Menge: wenige gründliche Dokumente statt vieler oberflächlicher.
- Wesentliche Änderungen in `docs/changelog.md` festhalten; offene Arbeit in `docs/roadmap.md`.
- Commits nur, wenn die Nutzerin darum bittet; Commit-Nachrichten auf Deutsch oder Englisch, kurz und präzise.
- Wenn Quellen nicht online geprüft werden können: das im Dokument ausdrücklich vermerken (`verification: unverified`).
