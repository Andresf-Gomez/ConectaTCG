# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Conecta TCG is a marketplace web app for buying and selling Pokemon TCG cards and sealed products in Colombia. It's a single-page application with client-side routing via state (no router library). All data is hardcoded mock data — there is no backend or API.

## Commands

- `npm run dev` — Start Vite dev server (port 5173)
- `npm run build` — Type-check with `tsc -b` then build with Vite
- `npm run lint` — Run ESLint
- `npm run preview` — Preview production build

## Tech Stack

- React 19 + TypeScript, Vite 8
- Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin, no `tailwind.config.js`)
- Framer Motion for page transitions
- Recharts for price history charts
- Lucide React for icons
- Prices formatted in COP (Colombian Pesos) via `Intl.NumberFormat`

## Architecture

The entire app lives in a single file: `src/App.tsx`. It contains:

- **Mock data**: `cards` array (13 products with nested `offers`) and `sellerReviews` at the top
- **Page routing**: The root `App` component manages a `page` state string. Each page is a function component rendered conditionally by matching the `page` value
- **Pages**: home, market (marketplace with filters), detail (card detail + price chart), sellerProfile, checkout, orderSuccess, publish, publishSuccess, sellerSale, shipmentSuccess, payout, history (transaction table), transactionDetail, commissions, contact, login
- **Shared components**: `Header`, `Layout`, `SearchBar`, `PriceBox`, `Metric`, `InfoPill`, `CardTile`, `OfferRow`, `OfferMini`
- **Commission logic**: Tiered rates (8% ≤100k, 6% ≤300k, 4% >300k COP) via `getCommissionRate/Value/Label`
- **Transaction management**: `transactions` state with status updates (confirm received, open case, payout to bank/balance)

## Styling

All styling uses Tailwind CSS v4 utility classes inline. The `src/index.css` file only contains `@import "tailwindcss"`. No custom CSS, no component library.
