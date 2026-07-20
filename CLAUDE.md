# CLAUDE.md

Guía para Claude Code (claude.ai/code) al trabajar en este repositorio.

## Project Overview

Conecta TCG es un marketplace web para comprar y vender cartas Pokémon TCG y producto sellado en Colombia. SPA con routing por estado (sin librería de router). Backend real en **Supabase self-hosted** (auth, Postgres, Storage, Edge Functions). Precios en COP vía `Intl.NumberFormat`.

## Commands

- `npm run dev` — Vite dev server (puerto 5173)
- `npm run build` — Type-check (`tsc -b`) + build Vite
- `npm run lint` — ESLint
- `npm run preview` — Preview del build

## Tech Stack

- React 19 + TypeScript, Vite 8
- Tailwind CSS v4 (plugin `@tailwindcss/vite`, sin `tailwind.config.js`)
- Framer Motion (transiciones), Recharts (gráficas), Lucide React (iconos)
- `@supabase/supabase-js`

## Architecture

La app está modularizada (ya NO vive en un solo `App.tsx`):

- **Routing**: `src/App.tsx` maneja un estado `page` (string) y hace props drilling de `setPage`. Sin URLs/deep-linking (se pierde estado al recargar — deuda conocida).
- **Páginas**: `src/pages/` — Home, Marketplace, DetailPage, Checkout, publicación (@src/pages/PublishPage.tsx, @src/pages/BulkPublishPage.tsx), dashboard vendedor, historial, y panel admin (@src/pages/AdminCardsPage.tsx, AdminSetsPage, AdminGamesPage, AdminCatalogPage).
- **Componentes**: `src/components/` (Header, Layout, CardTile, etc.)
- **Estado global**: `src/context/` (AuthContext, ThemeContext)
- **Datos**: `src/hooks/` (useCatalog, useCards, useListings), acceso a Supabase vía @src/lib/supabase.ts
- **Utilidades**: `src/utils/` — dinero en @src/utils/money.ts, comisiones escalonadas en @src/utils/commissions.ts (8% ≤100k, 6% ≤300k, 4% >300k COP)
- **Imágenes**: transformación de Storage (thumb/card/full) en @src/lib/imageUrl.ts
- **Esquema BD**: migraciones en `supabase/migrations/` (baseline + tabla `orders` con RPCs `place_order`/`update_order_status`)

## Styling

Todo con clases utilitarias de Tailwind v4 inline. `src/index.css` solo tiene `@import "tailwindcss"`. Sin CSS custom ni librería de componentes.

## Infraestructura / Deploy

Self-hosted en VPS Hostinger (Ubuntu, IP 2.24.192.71) gestionada con **Coolify**. Detalles y comandos en @docs/infraestructura.md.

- **App**: https://conectatcg.com (build del `Dockerfile` de este repo, servido por nginx)
- **Supabase propio**: https://api.conectatcg.com (Kong)
- **Deploy**: no hay auto-deploy por push; se dispara manualmente desde Coolify o su API.
- Config del build: @Dockerfile, @nginx.conf, @docker-compose.yml (compose local; en la VPS despliega Coolify, no compose manual).

## Mantenimiento de memoria del proyecto

- Al finalizar cambios importantes, actualiza este archivo o los docs en /docs
  con: decisiones de arquitectura tomadas, convenciones nuevas, y comandos
  que se agregaron o cambiaron.
- Registra el estado de tareas pendientes en docs/tareas.md usando checkboxes [ ].
- No dupliques aquí lo que ya está en el código; referencia archivos con @ruta.
- Mantén este archivo por debajo de ~200 líneas: si algo solo se necesita
  ocasionalmente, muévelo a /docs y referéncialo cuando haga falta.
