# PMS Portal — project memory

React 19 + TypeScript + Vite 8 + MUI v9 + lucide-react + Highcharts. Design screenshots are 2x (CSS px = image px / 2).
All data comes from mock API modules in `src/api/` (simulated latency, `{status, message, data}` envelope).
Dev server: `npm run dev` → http://localhost:5173/. Typecheck: `npx tsc -b` (run from project root).

## Conventions
- **Theme**: all colours/gradients/shadows/fonts live in `src/theme/` (`designTokens.ts` = the user's pasted design-system `tokens` verbatim + a `pms` key holding our measured values; `colors.ts` semantic groups + lightness-keyed scales like `colors.cream[971]`; `pms.ts` fonts/gradients/shadows/overlays; `index.ts` builds the MUI `theme` from tokens and exports `colors/gradients/shadows/overlays/fonts` = `tokens.pms.*`). `main.tsx` wraps App in ThemeProvider + CssBaseline (index.css was removed). Never hardcode hex/rgba in components — import from `../theme`.
- **rem everywhere**: `rem(px)` helper in `src/utils/format.ts` (px/16). Media queries in rem (`48rem` cards carousel, `40rem` My Strategies, `75rem` response side panel).
- Font Mulish; page bg `#f9f5f2`; maroon `#7a1f20`; gold `#a07a3c`; line `#ece6e0`.
- Mock response format (user's required format): `{ "status":"success", "message":"Fetched Successfully", "data": {...} }`.
- Pagination lives **only in the mock APIs** (user asked for no pagination UI): request `?page=&limit=` (default limit 10, `DEFAULT_LIMIT` in api/pagination.ts), response `data` has `total, page, limit, total_pages` (My Strategies uses camelCase `totalPages` and keeps `total`, `asOnDate`, `los`, `CliendCode` exactly as pasted). The UI just loads page 1; there is no Pagination component.
- Mobile: cards render as a **stack carousel** (front card full size, neighbours scaled .94 peeking both sides, simple swipe, no tilt).
- `highcharts-react-official` is CJS: use `(Mod as {default?}).default ?? Mod`.
- macOS `sed -i` fails on patterns with parens/quotes → use python3 or Edit.
- Testing in browser: `resize_window` doesn't change viewport; test narrow widths via same-origin iframe. Background tabs don't advance CSS transitions/rAF, so can't measure animations.
- Don't click the RD dialog's Download (builds a CSV; needs user permission).

## Folder structure (`src/`)
```
App.tsx                     page: numbered sections + "API responses" toggle
api/                        pagination.ts (paginate, Paged, PageParams, query, wait)
                            strategies.ts (3 PMS endpoints), myStrategies.ts, aifTopup.ts,
                            aifRedemption.ts, redemptions.ts (pending partial, paginated), rdFile.ts
hooks/useApiResource.ts     calls an API once; returns {data, loading, error}
theme/                      designTokens.ts, colors.ts, pms.ts, index.ts (see Conventions)
utils/format.ts             rem, formatInr/Crore/Aum/Short/Pct/Return, formatDate; utils/tags.ts (PMS/AIF tag colours)
components/
  cards/
    PmsCard/                PmsCard.tsx (purchase|summary|redemption), PmsCardSkeleton.tsx, index.ts
    MyStrategyCard/         MyStrategyCard.tsx (+tag S-curve, perf chart, range pills), …Skeleton, index
    AifTopupCard/           AifTopupCard.tsx (also exports AifCardShell, AifHeader), …Skeleton, index
    AifRedemptionCard/      AifRedemptionCard.tsx (Full/Partial radios, total, Redeem), …Skeleton (reuses topup's), index
  common/                   CardCarousel, Collapse (animated, exports EASE/COLLAPSE_MS), CheckDot, RadioOption,
                            Logo, Sparkline, PerformanceChart, Skeleton (Bone/SkeletonCard, abs placement x/y/right),
                            ApiResponsePanel (JSON highlight, copy), PageSection (+ResponsesVisibleContext)
  MyStrategiesSection.tsx   header, grid/list toggle, HScroller, MyStrategiesSkeleton; StrategyTable.tsx (list view)
  PendingRedemptionsDialog.tsx , RdFileDialog.tsx
```
Each card folder's `index.ts` exports `{Card, CardSkeleton, types}`.

## Page (App.tsx) sections, top to bottom
1. PMS Additional Purchase — `GET /api/pms/additional-purchase` (4 rows)
2. PMS Summary — `GET /api/pms/summary` (2 rows)
3. PMS Redemption — `GET /api/pms/redemption` (2 rows; str_201 has pending-partial link)
4. Invested Strategies — `GET /api/pms/my-strategies` (4 rows; grid + list table)
5. AIF Top-up — `GET /api/aif/topup` (2 funds)
6. AIF Redemption — `GET /api/aif/redemption` (1 fund)
7. Redemption Dialog APIs — response-only: pending partial redemptions (4 rows) and RD file
Wide screens (>75rem): UI left, sticky API-response panel right (toggle top-right hides all); narrower: panel below.
Every section shows skeletons until its API responds. Skeletons are laid out from measured coordinates of the real cards (PMS purchase 388px / summary 242 / redemption 325 tall; My Strategy 236×415).

## Key behaviours built
- PMS purchase card: select toggles check (maroon border + "Please enter an amount to proceed" error), amount input, Clear, ₹5L/₹10L/₹25L chips add, Undo reverts last chip, sparkline supports negative XIRR.
- Redemption card: Partial → amount input with × ; Full → "Full Redemption" + "View RD File" (dialog); "View Pending Partial Redemptions" dialog.
- My Strategy card: Invested/AUM/XIRR tiles, Highcharts Benchmark vs Portfolio columns, 1M/3M/6M/1Y/All pills (no per-click fetch; all ranges in response), PMS/AIF corner tag. List view = table with Actions (Performance, Invest More). ≤40rem: single card carousel, toggle hidden.
- AIF Top-up: collapsed summary row ↔ expanded sidebar + unit-class table (tick rows, Make Payment), smooth Collapse animation.
- AIF Redemption: per-unit Full/Partial radios; Full amount = invested value, Partial input capped at invested value; Total Redemption Amount; Redeem disabled until total > 0 and no empty Partial.

## Not done / ideas for next session
- Wire unconnected actions: My Strategy `Performance` / `Invest More`, AIF `Make Payment`, AIF `Redeem` (handlers exist as props, nothing attached), table filter icon is decorative.
- Not verified: narrow-screen layouts of the AIF cards, skeleton swap on mobile, side-panel sticky behaviour on short viewports, animation smoothness (couldn't observe in a background tab).
- Mock delays: PMS 600/450/750ms, others 500ms, dialogs 400ms (a temporary 60s hold was used to inspect skeletons, then reverted).
- Open question from user: AIF redemption screenshot showed the Redeem footer scrolling with the table; I kept it fixed under the table.
- Possible cleanup: `AifCardShell` still lives in AifTopupCard.tsx (could move to common/); `ViewToggle`/`HScroller` still inside MyStrategiesSection.
