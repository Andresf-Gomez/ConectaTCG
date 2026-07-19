#!/usr/bin/env bash
# Despliegue en la VPS: git pull + rebuild del contenedor.
# Requiere un .env junto a este archivo con VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY y opcionalmente WEB_PORT.
set -euo pipefail
cd "$(dirname "$0")"

git pull
docker compose up -d --build
docker image prune -f
docker compose ps
