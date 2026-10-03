# TEST_READY — Jirel Hitchen Hub E2E Automated Test Suite

## Test Execution Command
Run the complete automated test suite across all 4 Tiers:
```bash
node tests/run-all.mjs
```

### Granular Execution Options
- **Tier 1 (Feature Coverage)**: `node tests/run-all.mjs --tier=1`
- **Tier 2 (Boundary & Corner Cases)**: `node tests/run-all.mjs --tier=2`
- **Tier 3 (Combinations & Integrity)**: `node tests/run-all.mjs --tier=3`
- **Tier 4 (Real-World User Journey)**: `node tests/run-all.mjs --tier=4`
- **Strict Verification (Fails on any pending milestone)**: `node tests/run-all.mjs --strict`

Individual test files can also be run independently:
- `node tests/tier1-feature-coverage/schema-and-seed.test.mjs`
- `node tests/tier1-feature-coverage/paystack-checkout.test.mjs`
- `node tests/tier1-feature-coverage/verify-endpoint.test.mjs`
- `node tests/tier1-feature-coverage/product-detail.test.mjs`
- `node tests/tier1-feature-coverage/site-config.test.mjs`
- `node tests/tier1-feature-coverage/build-check.test.mjs`
- `node tests/tier2-boundary-cases/api-boundaries.test.mjs`
- `node tests/tier2-boundary-cases/cart-boundaries.test.mjs`
- `node tests/tier2-boundary-cases/slug-boundaries.test.mjs`
- `node tests/tier3-combinations/multi-category-cart.test.mjs`
- `node tests/tier3-combinations/order-snapshot.test.mjs`
- `node tests/tier4-scenarios/e2e-checkout-journey.test.mjs`

---

## Coverage Summary & Test Architecture

| Tier | Focus | Suites | Active Tests | Pending Milestone Tests | Status |
|---|---|:---:|:---:|:---:|:---:|
| **Tier 1** | Feature Coverage (F1–F14) | 7 | 11 | 22 | ✅ PASSED (Progressive) |
| **Tier 2** | Boundary & Corner Cases | 4 | 24 | 0 | ✅ PASSED |
| **Tier 3** | Cross-Feature Combinations & Schema Alignment | 3 | 9 | 0 | ✅ PASSED |
| **Tier 4** | Real-World End-to-End Checkout Journey | 1 | 5 | 0 | ✅ PASSED |
| **TOTAL** | Full Storefront Integration | **15** | **49** | **22** | **100% PASSED (0 Errors)** |

---

## Detailed Test Mapping

### Tier 1: Feature Coverage
- **F1 & F2 (Supabase DDL & RLS Policies)**: Validates migration files in `supabase/migrations/*.sql` for tables (`categories`, `products`, `product_variants`, `product_images`, `promos`, `orders`), required order columns, RLS enablement, and public read / guest order insert policies.
- **F3 (Catalog Seeds)**: Validates `supabase/seed.sql` for 6 categories, 10 products, 19 variants, 20 images matching the verified catalog.
- **F5 (Paystack Inline Checkout Trigger)**: Validates CartDrawer intake fields (`customer_name`, `email`, `customer_phone`, `shipping_address`), kobo amount conversion (`Math.round(subtotal * 100)`), and transaction reference format (`^JK_\d+_[a-zA-Z0-9]+$`).
- **F6 (Server Verification Route)**: Validates `POST /api/checkout/verify` payload schema, Paystack verification REST endpoint contract (`https://api.paystack.co/transaction/verify/:reference`), and confirmed order response structure.
- **F7 & F8 (Dynamic Product Detail & Routing)**: Validates Next.js 16 App Router `params` Promise contract (`await params`), slug matching, and display requirements.
- **F9 & F10 (OpenGraph SEO & Catalog Linking)**: Validates dynamic `generateMetadata` exports and `CookwareCard.tsx` links to `/products/[slug]`.
- **F11 & F12 (Centralized Config & .env.example)**: Validates `.env.example` placeholder variables and `src/config/site.ts` export structure.
- **F14 (Production Build)**: Executes TypeScript typecheck (`tsc --noEmit`) and validates build scripts in `package.json`.

### Tier 2: Boundary & Corner Cases
- **API Boundaries**: Rejects empty payloads, missing references, malformed references, missing customer names/emails/phones/addresses, empty item arrays, zero/negative prices, and client-side price tampering.
- **Cart Boundaries**: Tests cart item addition, duplicate variant incrementation, distinct variant segregation, quantity reduction to 0 (auto-removal), negative quantities, and floating-point kobo rounding precision.
- **Slug Boundaries**: Tests slug resolution for all authentic products, non-existent slugs (404 / undefined), path traversal attempts (`../`), XSS / SQL injection inputs, and case-sensitivity enforcement.

### Tier 3: Cross-Feature Combinations & Relational Integrity
- **Multi-Category Cart**: Tests checkout with items combined from Pots & Pans, Knives, Utensils, and Baking; asserts subtotal calculation, sale price prioritization, and kobo conversion fidelity.
- **Relational Integrity**: Audits all 10 products against 6 category IDs, all 19 variants against products, and all 20 images against products.
- **Order Snapshot**: Validates JSON serialization and round-trip fidelity for Supabase `orders.items` snapshot schema.

### Tier 4: Real-World Scenarios
- **End-to-End User Journey Simulation**: Models complete shopper flow:
  1. Browse catalog categories and products
  2. Inspect product detail view and select variant
  3. Add items to cart across categories
  4. Complete customer intake form
  5. Generate Paystack transaction kobo payload and unique reference
  6. Simulate payment popup authorization
  7. Submit to verification route and validate Paystack response
  8. Confirm order record and generate WhatsApp concierge receipt link

---

## Discovered Implementation Bugs (Escalated to Implementing Agents)

1. **Orphaned Variant in Product Images (`src/data/products.ts`)**:
   - `prod-10` ("Non-Stick Baking Sheet") has image `img-10-2` referencing `variantId: 'var-10-2'`.
   - However, `prod-10.variants` only defines `var-10-1` ("Gray").
   - **Impact**: Will trigger a PostgreSQL foreign key violation in M1 if `supabase/seed.sql` inserts `img-10-2` with `variant_id = 'var-10-2'` into `product_images`.
   - **Resolution for M1**: Either define `var-10-2` in variants or update `img-10-2`'s `variantId` to `var-10-1`.

2. **ESLint Ignore Configuration (`eslint.config.mjs`)**:
   - `npm run lint` fails because `.vercel/**` and `.agents/**` are not listed in `globalIgnores` in `eslint.config.mjs`.
   - Scheduled for fix in Milestone 4 (F13).
