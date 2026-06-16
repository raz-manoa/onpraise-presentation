# OnPraise Presentation

App Next.js pour gérer des playlists de culte, des partitions ChordPro et des liens de présentation publics.

## Prérequis

- Node.js 20+
- PostgreSQL (Docker local ou Neon)

## Démarrage local

```bash
cp .env.example .env.local

# Option A — Postgres local (Docker)
docker compose up -d
pnpm db:push
pnpm db:seed

# Option B — Postgres déjà installé localement
# Adapter DATABASE_URL dans .env.local puis :
pnpm db:push
pnpm db:seed

pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Demo publique après seed : [http://localhost:3000/p/demo123456](http://localhost:3000/p/demo123456)

## Scripts

- `pnpm dev` — serveur de développement
- `pnpm build` — build production
- `pnpm db:push` — applique le schéma Drizzle
- `pnpm db:seed` — données de démo

## Fonctionnalités v1

- Bibliothèque de chants (format ChordPro, aperçu live)
- Playlists avec réordonnancement drag-and-drop
- Lien public `/p/[code]` : swipe horizontal entre chants, scroll vertical des paroles, transposition
