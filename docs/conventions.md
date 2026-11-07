# Konventionen & Datenmodell

Verbindliche Regeln stehen in [`CLAUDE.md`](../CLAUDE.md). Diese Datei beschreibt, **wie** Inhalte angelegt werden, damit die Website sie automatisch anzeigt.

Nach jeder Änderung: `cd website && npm run validate`

## 1. IDs

- kebab-case, nur ASCII: `a-z`, `0-9`, `-` (keine Diakritika)
- stabil – eine ID wird nie umbenannt, da andere Einträge auf sie verweisen
- global eindeutig über alle Dateien hinweg
- Präfixe: `src-` Quelle, `evt-` Ereignis, `loc-` Ort, `q-` Forschungsfrage. Texte, Figuren, Dynastien und Forschungsdokumente ohne Präfix (`rigveda`, `krishna`, `kuru`, `yuga-system`)
- Quellen-IDs: `src-<nachname>-<jahr>-<stichwort>`

## 2. Evidenzkategorien

`primary` · `established` · `hypothesis` · `tradition` · `disputed` · `unresolved` – Bedeutung siehe `CLAUDE.md`. Ein Eintrag kann mehrere tragen (z. B. `[primary, disputed]`: im Text belegt, Interpretation umstritten).

## 3. Forschungsdokumente – `research/<bereich>/<id>.md`

```markdown
---
id: yuga-system                 # Pflicht
title: Das Yuga-System …         # Pflicht
title_iast: yuga · kalpa         # optional, IAST
area: cosmology                  # Pflicht, = Ordnername
summary: Ein bis drei Sätze.     # Pflicht
evidence: [primary, tradition]   # Pflicht
status: draft | review | stable  # Pflicht
verification: verified | partial | unverified
period: Zeitraum, auf den sich das Dokument bezieht
sources: [src-…]                 # Pflicht, mind. eine
related: [ids …]                 # Querverweise
created: 2026-11-07
updated: 2026-11-07
---
```

Im Text verlinken: `[[id]]` oder `[[id|Beschriftung]]`.

**Gliederung (12 Pflichtpunkte aus dem Projektauftrag):**

1. Zusammenfassung
2. Detaillierte Beschreibung
3. Textquellen und Originalstellen (Stelle, Edition, Prüfstand)
4. Originalwortlaut (wenn verfügbar, IAST/Devanāgarī)
5. Übersetzung – mit Angabe, von wem (oder „eigene Arbeitsübersetzung“)
6. Historischer Kontext
7. Wissenschaftliche Interpretation
8. Abweichende Interpretationen
9. Quellenangaben (über `sources`)
10. Einschätzung der Quellenqualität
11. Offene Forschungsfragen
12. Evidenzkategorie je Kernaussage im Text: **Kategorie:** …

Ungeprüfte Stellenangaben im Text mit *(Stelle prüfen)* markieren.

## 4. Kurskapitel – `chapters/<modul-id>/<kapitel-id>.md`

Erzählende Kapitel im Stil wissenschaftlicher Essays; Grundlage für Kursmodule. Die Gliederung (Module, Reihenfolge, geplante Kapitel) steht in `chapters/modules.json`. Ein Kapitel, das dort gelistet ist, aber noch keine Datei hat, gilt als „geplant“.

IDs: Module `mod-NN-stichwort`, Kapitel `kap-stichwort`.

```markdown
---
id: kap-rigveda                      # Pflicht
module: mod-03-veden                 # Pflicht, muss in modules.json existieren
order: 1                             # Pflicht
title: Der Ṛgveda                    # Pflicht
subtitle: Dichtung, Ritual …
summary: 2–3 Sätze (Teaser)          # Pflicht
reading_time: 14                     # Minuten
evidence: [primary, disputed]        # Pflicht
status: draft | review | stable      # Pflicht
verification: partial
learning_objectives: [ … ]           # 3–5 überprüfbare Ziele
key_terms:                           # Glossar
  - term: Saṃhitā
    iast: saṃhitā
    meaning: "Erklärung (bei Doppelpunkt im Text in Anführungszeichen setzen)"
reflection: [ … ]                    # 2–4 offene Fragen
sources: [src-…]                     # Pflicht
related: [ids …]
scenario: |
  Einstiegsszene (Markdown). Am Ende kursiv: was erfunden, was belegt ist.
---
Haupttext in Markdown. Abschnitte mit ##, Kernaussagen mit **Kategorie:** …,
Originalzitate als Blockzitat mit Stellenangabe, Übersetzer bzw. „Arbeitsübersetzung“.
```

**Aufbau des Haupttextes (Richtwert):** Einstieg/These → Kontext → Primärquellen (Zitat, Übersetzung) → Tradition vs. Forschung → Kontroversen mit Gegenpositionen → Ausblick/Überleitung zum nächsten Kapitel. Umfang ca. 1.500–2.500 Wörter.

**Export:** `cd website && npm run export` erzeugt `export/courses.json` (Module, Kapitel, Text, Szenario, Lernziele, Glossar, Fragen, Quellen mit Zitation).

**Achtung YAML:** Texte mit „: “ (Doppelpunkt + Leerzeichen), z. B. „4 : 3 : 2 : 1“, in Anführungszeichen setzen.

## 5. JSON-Daten – `data/<ordner>/*.json`

Jede Datei enthält ein Array von Einträgen (oder ein einzelnes Objekt). Dateien dürfen beliebig aufgeteilt werden (z. B. `characters/mahabharata.json`, `characters/ramayana.json`).

| Ordner | Pflichtfelder | Wichtige optionale Felder |
|---|---|---|
| `texts/` | `id`, `title`, `category` | `title_iast`, `devanagari`, `summary`, `structure`, `dating.scholarly`, `dating.traditional`, `evidence`, `sources`, `related` |
| `characters/` | `id`, `name` | `name_iast`, `devanagari`, `summary`, `texts`, `dynasty`, `relations`, `locations`, `events`, `historicity`, `evidence`, `sources` |
| `dynasties/` | `id`, `name` | `summary`, `texts`, `members`, `evidence`, `sources` |
| `locations/` | `id`, `name`, `kind` | `name_iast`, `coordinates: [lat, lng]`, `modern`, `summary`, `texts`, `evidence`, `sources` |
| `timeline/` | `id`, `title`, `chronology`, `start`, `display` | `end`, `summary`, `evidence`, `sources`, `related` |
| `references/` | `id`, `type`, `authors`, `title`, `quality` | `year`, `publisher`, `series`, `url`, `areas`, `verified`, `notes` |
| `questions/` | `id`, `question`, `kind`, `status` | `area`, `notes`, `related`, `sources` |

**Wertelisten**

- `texts.category`: `veda`, `brahmana`, `aranyaka`, `upanishad`, `sutra`, `smriti`, `itihasa`, `purana`, `shastra`, `other`
- `locations.kind`: `site`, `city`, `kingdom`, `river`, `sacred`, `region`, `mountain`
- `timeline.chronology`: `scholarly` (wissenschaftliche Datierung) | `traditional` (traditionelle Chronologie). `start`/`end` als Jahreszahl, **v. Chr. negativ** (−2600 = 2600 v. Chr.). `display` ist der angezeigte Text inkl. „ca.“.
- `characters.relations[].type`: `father`, `mother`, `spouse`, `sibling`, `half-sibling`, `cousin`, `teacher`, `student`, `ally`, `opponent`, `devotee`, `other`. Die Beziehung wird aus Sicht der Figur angegeben: `{ "type": "father", "target": "pandu" }` = „mein Vater ist Pāṇḍu“. Umkehrbeziehungen (Kinder) berechnet die Website selbst.
- `characters.historicity`: eine Evidenzkategorie zur Frage, ob die Person historisch belegt ist (fast immer `unresolved`).
- `references.type`: `primary`, `critical-edition`, `translation`, `inscription`, `excavation-report`, `book`, `article`, `institutional`, `online`, `modern-interpretation`
- `references.quality`: `high`, `medium`, `low`; `verified: true` erst nach Prüfung von Autor, Titel, Jahr, Verlag am Exemplar oder Katalog.
- `questions.kind`: `open`, `contradiction`, `missing-source`, `hypothesis`, `todo`; `status`: `open`, `in-progress`, `answered`

## 6. Sanskrit

- Umschrift nach **IAST** (ā ī ū ṛ ṝ ḷ ṅ ñ ṭ ḍ ṇ ś ṣ ṃ ḥ), Devanāgarī zusätzlich in `devanagari`
- Felder `title`/`name`: gebräuchliche Form ohne Diakritika (für Suche und Sortierung); `title_iast`/`name_iast`: wissenschaftliche Form
- Die Suche ignoriert Diakritika („rgveda“ findet „Ṛgveda“)
