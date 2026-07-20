# Tareas — Conecta TCG

Estado de tareas pendientes. Marcar con `[x]` al completar.

## Hecho recientemente (sesión 2026-07-18/19)

- [x] Consolidar todas las ramas `feature/*` y worktrees en `main` (una sola rama de trabajo)
- [x] Sacar `public/catalog.json` (10.7 MB, sin uso en runtime) del build; el script lo genera en `scripts/output/`
- [x] Dockerizar el frontend (@Dockerfile, @nginx.conf) y desplegar en la VPS vía Coolify
- [x] Migrar de Supabase cloud a **Supabase self-hosted** en la VPS (esquema, RLS, 30k cartas, 24,583 imágenes, usuarios, edge function)
- [x] Corregir migración `orders`: tipos `bigint` para `listing_id`/`catalog_card_id` (antes `uuid`/`integer`, era inaplicable)
- [x] Dominio propio con SSL: app en https://conectatcg.com, API en https://api.conectatcg.com

## Pendiente — infraestructura

- [ ] Configurar SMTP en el Supabase self-hosted (hoy `ENABLE_EMAIL_AUTOCONFIRM=true`; no salen emails de confirmación ni de recuperación de contraseña)
- [ ] Decidir bajar/pausar el proyecto Supabase cloud (uuzejzgmrvrznnrmrnej, plan de pago) y el deploy de Vercel, tras validar producción unos días
- [ ] (Opcional) Webhook de auto-deploy en Coolify para desplegar en cada push a `main`

## Pendiente — correctitud del marketplace (de la auditoría)

- [ ] **Conectar el checkout real**: hoy la compra es mock; nadie pasa `listingId` a `Checkout`, no se crea orden ni se descuenta stock. El motor `orders` (RPCs) ya está en la BD y funciona. Propagar el UUID del listing hasta @src/pages/Checkout.tsx
- [ ] Resolver colisión de modelos de transacción: `transactions` (usada en @src/pages/SellerDashboardPage.tsx) vs `orders` (RPCs) vs mock en HistoryPage — unificar sobre `orders`
- [ ] Job de expiración de órdenes `pending` (retienen stock indefinidamente; permite agotar stock ajeno)
- [ ] Unificar base de cálculo de comisión: SQL usa precio unitario, cliente usa total (@src/utils/commissions.ts)

## Pendiente — seguridad (de la auditoría)

- [ ] Verificar/blindar que `profiles.role` no sea auto-editable por el usuario (riesgo de auto-promoción a admin); versionar la política RLS
- [ ] Filtrar `.eq('seller_id', user.id)` en mutaciones de `listings` (defensa en profundidad) en @src/pages/SellerDashboardPage.tsx
- [ ] Sanear input en búsquedas con `.or()` interpolado (@src/hooks/useCatalog.ts, AdminCardsPage, AdminSetsPage)
- [ ] Revocar el token API de Coolify usado en la sesión de deploy

## Pendiente — calidad de código (de la auditoría)

- [ ] Activar `strict: true` en `tsconfig.app.json` y generar `src/database.types.ts` (`supabase gen types`)
- [ ] Comprobar `error` en todas las mutaciones de Supabase (varias hoy actualizan la UI asumiendo éxito)
- [ ] Paginación server-side en el marketplace (@src/hooks/useListings.ts trae todo, se corta a 1000 en PostgREST)
- [ ] Borrar `src/App.backup.tsx` (código muerto) y arreglar errores de lint
- [ ] Migrar Home de la tabla legacy `cards` a `listings` (doble fuente de verdad)
