# Plan d'implémentation — OnPraise Presentation (v1)

App Next.js pour préparer des **setlists de culte** et les partager via un **lien public consultable au doigt**.

## 1. Objectif & périmètre v1

**Dans la v1 :**
- Créer/éditer une playlist (setlist)
- Créer un chant (ChordPro) ou en piocher un dans la bibliothèque → l'ajouter à la playlist, gérer l'ordre
- Générer un lien public `/p/[code]` : vue mobile, **swipe gauche/droite = chant suivant/précédent**, **scroll vertical = parcourir les paroles d'un chant**, sélecteur de tonalité (transposition)

**Hors v1 (plus tard) :** comptes utilisateurs, présentation live synchronisée, import .pro, upload PDF, thèmes projecteur.

## 2. Stack technique (décisions arrêtées)

| Domaine | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | server components pour la vue publique = rapide et léger |
| UI | **Tailwind CSS + shadcn/ui** | composants propres, rapides à poser |
| Données | **Postgres (Neon) + Drizzle ORM** | le plus simple sans service complexe ; serverless, gratuit, déployable sur Vercel. *(Alternative équivalente : SQLite/Turso)* |
| Validation | **Zod** | sécuriser les server actions |
| Partitions | **chordsheetjs** | parse ChordPro, rend en HTML, transpose les accords |
| Carousel public | **CSS scroll-snap natif** (zéro dépendance) | swipe horizontal + scroll vertical imbriqué, sans lib |
| Mutations | **Server Actions** | pas d'API REST à maintenir pour un MVP |
| Déploiement | **Vercel** | natif Next.js |

> Pas de Realtime, pas de Supabase Auth/Storage en v1 — inutiles pour ces 3 features.

## 3. Arborescence du projet

```
src/
  app/
    layout.tsx
    page.tsx                      # accueil → liste des playlists
    playlists/
      page.tsx                    # liste + bouton "Nouvelle playlist"
      [id]/
        page.tsx                  # éditeur de playlist (ordre, ajout de chants)
    songs/
      page.tsx                    # bibliothèque de chants
      new/page.tsx                # éditeur ChordPro (création)
      [id]/edit/page.tsx          # éditeur ChordPro (édition)
    p/
      [code]/page.tsx             # VUE PUBLIQUE (server component, lecture seule)
  components/
    playlist/                     # PlaylistEditor, SongPicker, SortableList...
    song/                         # ChordProEditor, ChordSheet (rendu), KeySelector
    public/                       # SongSwiper (scroll-snap), PublicHeader
    ui/                           # shadcn
  db/
    schema.ts                     # tables Drizzle
    index.ts                      # client db
  lib/
    chordpro.ts                   # parse + format + transpose (wrapper chordsheetjs)
    actions/                      # server actions (playlists.ts, songs.ts)
    share.ts                      # génération du share_code
```

## 4. Modèle de données (Drizzle)

```
songs : la bibliothèque de chants
  id          uuid pk
  title       text not null
  author      text
  ccli        text                 // référence droits d'auteur (optionnel)
  originalKey text                 // ex "G", "Am"
  content     text not null        // source ChordPro brute
  createdAt   timestamp
  updatedAt   timestamp

playlists : une setlist de culte
  id         uuid pk
  title      text not null
  shareCode  text unique          // code aléatoire ~10 car. pour /p/[code]
  isPublic   boolean default false
  createdAt  timestamp

playlistSongs : jointure ordonnée
  id         uuid pk
  playlistId uuid fk -> playlists (cascade delete)
  songId     uuid fk -> songs
  position   integer not null     // ordre dans la setlist
  keyOverride text                // tonalité spécifique pour ce culte (optionnel)
```

Index : `playlistSongs(playlistId, position)`, `playlists(shareCode)`.

## 5. Pages & comportements

**`/playlists/[id]` (éditeur) — features 1 & 2**
- Renommer la playlist
- Liste ordonnée des chants avec **drag-and-drop** (`@dnd-kit`) → met à jour `position`
- Bouton **"Ajouter un chant"** → modal `SongPicker` : recherche dans la bibliothèque + lien "Créer un nouveau chant"
- Bouton **"Partager"** → génère/active `shareCode`, affiche l'URL `/p/[code]` + copier

**`/songs/new` et `/songs/[id]/edit` — éditeur ChordPro**
- Zone texte (CodeMirror ou textarea simple en v1) avec syntaxe ChordPro : `{title: ...}`, `[G]paroles`, `{start_of_chorus}`
- **Aperçu live** à droite via `ChordSheet`
- Champs : titre, auteur, tonalité d'origine, CCLI

**`/p/[code]` — feature 3, la vue publique (le cœur de l'UX)** — voir §6

## 6. La vue publique en détail (swipe)

Server Component qui charge la playlist + chants par `shareCode`, puis passe au client le composant `SongSwiper`.

**Mécanique CSS (zéro lib) :**
```
Conteneur horizontal : overflow-x scroll + scroll-snap-type: x mandatory
  └── Pour chaque chant : panneau plein écran (w-screen, scroll-snap-align: start)
        └── overflow-y auto  → scroll vertical des paroles à l'intérieur
```
- **Swipe horizontal** = passe au chant suivant/précédent (snap)
- **Scroll vertical** = parcourt les paroles d'un long chant
- Indicateurs : "Chant 3 / 8" + points de pagination
- **Sélecteur de tonalité** en header → transpose via chordsheetjs (recalcule le rendu)
- Flèches clavier ← → pour desktop, gros texte lisible
- Page non indexée (`robots: noindex`) vu le droit d'auteur (CCLI)

## 7. Format ChordPro & rendu (`lib/chordpro.ts`)

```typescript
import { ChordProParser, HtmlDivFormatter, Song } from 'chordsheetjs';

// parse la source ChordPro
export function parseSong(source: string): Song

// rend en HTML (accords au-dessus des paroles)
export function renderHtml(song: Song): string

// transpose de N demi-tons (pour le sélecteur de tonalité)
export function transpose(song: Song, semitones: number): Song
```
Rendu stylé en CSS (accords en couleur/gras au-dessus du mot). Le refrain (`{start_of_chorus}`) reçoit une mise en forme distincte.

## 8. Étapes d'implémentation (ordre conseillé)

1. **Setup** : `create-next-app` (TS, Tailwind, App Router) + shadcn/ui + Drizzle + Neon, variables d'env
2. **Schéma + migrations** Drizzle, fonctions de seed (2-3 chants de test)
3. **Bibliothèque de chants** : liste + éditeur ChordPro + aperçu (`lib/chordpro.ts`) — cœur, on commence ici
4. **Playlists** : CRUD + page éditeur + drag-and-drop d'ordre
5. **SongPicker** : recherche + ajout de chant à une playlist
6. **Partage** : génération `shareCode` + activation publique
7. **Vue publique `/p/[code]`** : `SongSwiper` scroll-snap + transposition + clavier
8. **Polish** : responsive, états vides, `noindex`, raffinements UX
9. **Deploy** Vercel + Neon

## 9. Risques & points de vigilance

- **Droit d'auteur (CCLI)** : lien public = paroles visibles de tous. Mitigation : code aléatoire long + `noindex`.
- **Saisie ChordPro** : c'est la corvée. Prévoir un bon aperçu live ; mode "paroles simples" possible plus tard.
- **Scroll imbriqué mobile** : tester tôt sur vrai téléphone (`touch-action` peut nécessiter des ajustements).

## 10. Plus tard (v2+)

Présentation live synchronisée (Supabase Realtime), comptes utilisateurs, import .pro/PDF, thèmes projecteur grand écran, PWA offline.

---

## Références

- `mfuentesg/capo-app` — projet quasi identique (Next.js + ChordPro + playlists + partage public par code + Supabase)
- `chordsheetjs` — parsing/rendu/transposition ChordPro
- JSong, Gospel Presenter, TheOpenPresenter, FreeShow, OpenLP — outils de présentation de culte (inspiration UX)
