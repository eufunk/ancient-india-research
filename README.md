# ancient-india-research

Interdisziplinäre Forschung über das antike Indien – Veden, Mahābhārata, Rāmāyaṇa, Purāṇas, Sanskrit, Geschichte, Archäologie, Astronomie und vedische Kosmologie.

Das Projekt besteht aus einem **quellenbasierten Forschungsarchiv** (Markdown + JSON) und einer **lokalen Webanwendung**, mit der die Erkenntnisse durchsucht, gefiltert und über Querverweise erkundet werden können. Traditionelle Überlieferung, Primärquellenbeleg und wissenschaftliche Datierung werden durchgehend getrennt gekennzeichnet.

## Website starten (nur lokal)

Voraussetzung: [Node.js](https://nodejs.org) ab Version 20.

**Windows:** Doppelklick auf `start-website.bat`

**Oder im Terminal:**

```bash
cd website
npm install      # nur beim ersten Mal
npm run dev
```

Die Seite öffnet sich unter **http://localhost:5173**. Der Server lauscht nur auf `127.0.0.1` und ist von außen nicht erreichbar. Änderungen an Dateien in `research/` oder `data/` erscheinen sofort im Browser.

Beenden: `Strg + C` im Terminal.

## Bereiche der Website

Übersicht (Dashboard) · **Kurse & Kapitel** (erzählende Kurskapitel mit Szenario, Lernzielen, Glossar) · Schriften · Geschichte & Archäologie · Kosmologie & Astronomie (mit interaktivem Yuga-Diagramm) · Philosophie & Wissen · Figuren & Genealogie · Zeitleiste (Tradition vs. Wissenschaft) · Geografie · Quellen · Forschungsfragen · globale Suche (Taste `/`)

## Projektstruktur

```text
chapters/   Kurskapitel (Essays) je Modul + modules.json – Grundlage für Kursmodule
export/     courses.json für die Kurs-App (erzeugt mit: cd website && npm run export)
research/   Forschungsdokumente (Markdown + YAML-Frontmatter), ein Ordner je Bereich
data/       Strukturierte Daten (JSON): Schriften, Figuren, Dynastien, Orte, Zeitleiste, Quellen, Fragen
docs/       Projektauftrag, Konventionen, Pläne
website/    React-Anwendung – liest research/ und data/, enthält selbst keine Inhalte
```

## Inhalte ergänzen

1. Datenmodell und Pflichtfelder: [docs/conventions.md](docs/conventions.md)
2. Arbeitsregeln (Quellen, Evidenzkategorien): [CLAUDE.md](CLAUDE.md)
3. Nach Änderungen prüfen:

```bash
cd website
npm run validate     # IDs, Pflichtfelder, Verweise, Quellen
npm run test:smoke   # rendert alle Seiten und meldet Fehler
npm run build        # Typprüfung + Produktions-Build
```

## Technik

React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router · react-markdown · Lucide Icons. Schriften lokal eingebunden (Fontsource) – die Anwendung funktioniert ohne Internetverbindung.
