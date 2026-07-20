# Infraestructura y deploy — Conecta TCG

Self-hosted en VPS Hostinger KVM 2 (Ubuntu 24.04, 8 GB RAM, IP `2.24.192.71`), gestionada con **Coolify 4.1.2**. El proxy Traefik de Coolify ocupa 80/443/8080 y emite certificados Let's Encrypt automáticamente. **No usar `docker compose` manual en la VPS** — todo se despliega vía Coolify.

## URLs

| Qué | URL |
|-----|-----|
| App (frontend) | https://conectatcg.com |
| Supabase (Kong) | https://api.conectatcg.com |
| Panel Coolify | http://2.24.192.71:8000 |

DNS en Hostinger: registros A `@` y `api` → `2.24.192.71`.

## Recursos en Coolify

- App `conecta-tcg-web` (uuid `myehicoeii2yx6g9hzp5e4fp`): build del `Dockerfile` del repo `Andresf-Gomez/ConectaTCG` rama `main`.
- Servicio `supabase-conecta` (uuid `rezblibkzkx66drmhdzj7dbp`): stack Supabase propio.
  - Config en la VPS: `/data/coolify/services/rezblibkzkx66drmhdzj7dbp/.env` (claves y dominios).
  - Contenedor de BD: `supabase-db-rezblibkzkx66drmhdzj7dbp` → `docker exec -it <cont> psql -U postgres -d postgres`.
- **Independiente**: el servicio Supabase de Drew Store (otra app, `api.drewstore.co`) NO se toca desde Conecta.

## Variables de entorno del frontend

Build-time (horneadas en el bundle; la anon key es pública por diseño):

- `VITE_SUPABASE_URL=https://api.conectatcg.com`
- `VITE_SUPABASE_ANON_KEY=<anon key del servicio>`

## Deploy manual

No hay auto-deploy por push. Desde el panel de Coolify (botón Deploy) o por API:

```
GET http://localhost:8000/api/v1/deploy?uuid=myehicoeii2yx6g9hzp5e4fp&force=true
Authorization: Bearer <token>
```

Los tokens de Coolify tienen scopes separados (`read`/`write`/`deploy`/`root`): para PATCH/deploy se necesita `write`+`deploy`; sin `read` los GET fallan pero las escrituras funcionan. Ejecutar la API vía SSH a `localhost:8000` para no exponer el token.

## Cambiar el dominio (procedimiento)

1. DNS: apuntar el nuevo host a `2.24.192.71` y esperar propagación.
2. Coolify: PATCH `domains` de la app + PATCH envs (`VITE_SUPABASE_URL`, `SERVICE_FQDN_SUPABASEKONG`, `SERVICE_URL_SUPABASEKONG`, `GOTRUE_SITE_URL`, `ADDITIONAL_REDIRECT_URLS`).
3. Reescribir imágenes en BD: `UPDATE catalog_cards SET image_url = replace(image_url, '<host viejo>', 'https://<host nuevo>')`.
4. Restart del servicio Supabase (emite el cert nuevo) + redeploy del frontend.
5. Verificar HTTPS con cert válido (`curl` sin `-k`, `ssl_verify_result=0`).

## Auth (notas)

- `GOTRUE_SITE_URL` y `ADDITIONAL_REDIRECT_URLS` = URL de la app.
- `ENABLE_EMAIL_AUTOCONFIRM=true` porque no hay SMTP configurado: los registros se auto-confirman y NO salen emails de recuperación. Configurar SMTP para producción real.

## Backend heredado

El proyecto Supabase cloud (`uuzejzgmrvrznnrmrnej.supabase.co`) y el deploy de Vercel siguen vivos como respaldo mientras se valida la VPS. Ver estado en @docs/tareas.md.
