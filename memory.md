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
- Reports-page screenshots are 2x captures at ~87.5% browser zoom (CSS px = image px / 1.75). `components/reports/ReportsParts.tsx` exports a **scaled** `rem(px)` = `baseRem(px*2/1.75)` for those pages; direct CSS px (mobile ≈ image px / 1.57) use `rem as css` from `utils/format`. **Decision (user chose to keep it):** the `baseRem` alias in ReportsParts stays; new code outside Reports uses plain `rem` from `utils/format` only. Calibrate fonts by measuring rendered text widths in the browser (TreeWalker + Range) against reference widths.
- Don't click the RD dialog's Download (builds a CSV; needs user permission).

## Git / repo
- Commits: `2c6c032` first build; `f4f561d` profiles, reports page, shared dialogs; `27d1e45` AIF My Strategies card + Pms/Aif split (local, **not pushed** yet; `main` is 1 ahead of `origin/main`).
- Untracked and deliberately left out of commits: `.agents/`, `.claude/`, `skills-lock.json`.
- Remote: https://github.com/DhirajPrajapati/PMS.git (`origin`), branch `main` tracks `origin/main`.
- First commit `2c6c032` ("Build PMS portal: strategy cards, My Strategies, AIF cards, themed mock APIs") holds the original 58 files. `.gitignore` excludes node_modules and dist.
- Local git identity (repo-only): DhirajPrajapati / prajapatidheeraj005@gmail.com. Commit/push only when the user asks. Commit messages end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Folder structure (`src/`)
```
App.tsx                     page: numbered sections + "API responses" toggle
api/                        pagination.ts (paginate, Paged, PageParams, query, wait)
                            strategies.ts (3 PMS endpoints), myStrategies.ts, aifTopup.ts,
                            aifRedemption.ts, redemptions.ts (pending partial, paginated), rdFile.ts,
                            profiles.ts (My Profile cards), reports.ts (PMS/AIF-old reports: holders, di-codes,
                            catalog, advanced-options, generate), aifReports.ts (AIF tab: schemes, options, generate)
hooks/useApiResource.ts     calls an API once; returns {data, loading, error}
theme/                      designTokens.ts, colors.ts, pms.ts, index.ts (see Conventions)
utils/format.ts             rem, formatInr/Crore/Aum/Short/Pct/Return, formatDate; utils/tags.ts (PMS/AIF tag colours)
components/
  cards/
    PmsCard/                PmsCard.tsx (purchase|summary|redemption), PmsCardSkeleton.tsx, index.ts
    MyStrategyCard/         MyStrategyCard.tsx (dispatcher: aif ? Aif : Pms), PmsStrategyCard, AifStrategyCard, StrategyCardShell (frame+tag+header), shared.ts (C, PX, font, tile styles), types.ts, …Skeleton, index
    AifTopupCard/           AifTopupCard.tsx (also exports AifCardShell, AifHeader), …Skeleton, index
    AifRedemptionCard/      AifRedemptionCard.tsx (Full/Partial radios, total, Redeem), …Skeleton (reuses topup's), index
  common/                   DialogShell (shared dialog frame: accent bar, white header w/ chip close, footer — use for ALL dialogs),
                            ConfirmDialog (on DialogShell; also exports glossButton), CardCarousel, Collapse (animated, exports EASE/COLLAPSE_MS), CheckDot, RadioOption,
                            Logo, Sparkline, PerformanceChart, Skeleton (Bone/SkeletonCard, abs placement x/y/right),
                            ApiResponsePanel (JSON highlight, copy), PageSection (+ResponsesVisibleContext)
  MyStrategiesSection.tsx   header, grid/list toggle, HScroller, MyStrategiesSkeleton; StrategyTable.tsx (list view)
  PendingRedemptionsDialog.tsx , RdFileDialog.tsx (now built on common/DialogShell)
  ProfilesSection.tsx       My Profile cards (single select, click again deselects); cards/ProfileCard/
  reports/                  Investment Reports page (hash route #/reports; "Investment Reports page →" link in portal header)
    ReportsPage.tsx         header + PMS/AIF ProductToggle; PMS = 4-step flow (holder + DI-code dropdowns side by side,
                            categories, report cards with "Advance Options", criteria, download/email), AIF = <AifReports/>
    AifReports.tsx          AIF tab: search + All/CAT II/CAT III, scheme cards, folio chips (mobile: dropdown + reset icon),
                            holders/broker/value panel, single-select report tiles, SOA criteria, Download via Email / Direct Download,
                            mobile bottom-sheet (Drawer) for report picking
    AdvancedOptionsDialog   section list left (dropdown on mobile) + radios; opens on "Advance Options"
    ReportsStepper, ReportsParts (scaled rem, R colours, Chip, SectionCard), SelectField (pill dropdown), DateField
```
Each card folder's `index.ts` exports `{Card, CardSkeleton, types}`.

## Page (App.tsx) sections, top to bottom
1. PMS Additional Purchase — `GET /api/pms/additional-purchase` (4 rows)
2. PMS Summary — `GET /api/pms/summary` (2 rows)
3. PMS Redemption — `GET /api/pms/redemption` (2 rows; str_201 has pending-partial link)
4. Invested Strategies — `GET /api/pms/my-strategies` (4 rows; grid + list table)
5. AIF Top-up — `GET /api/aif/topup` (2 funds)
6. AIF Redemption — `GET /api/aif/redemption` (1 fund)
7. My Profile — `GET /api/profiles` (4 cards; selectable)
8. Redemption Dialog APIs — response-only: pending partial redemptions (4 rows) and RD file
Wide screens (>75rem): UI left, sticky API-response panel right (toggle top-right hides all); narrower: panel below.
Every section shows skeletons until its API responds. Skeletons are laid out from measured coordinates of the real cards (PMS purchase 388px / summary 242 / redemption 325 tall; My Strategy 236×415).

## Key behaviours built
- PMS purchase card: select toggles check (maroon border + "Please enter an amount to proceed" error), amount input, Clear, ₹5L/₹10L/₹25L chips add, Undo reverts last chip, sparkline supports negative XIRR.
- Redemption card: Partial → amount input with × ; Full → "Full Redemption" + "View RD File" (dialog); "View Pending Partial Redemptions" dialog.
- My Strategy card: Invested/AUM/XIRR tiles, Highcharts Benchmark vs Portfolio columns, 1M/3M/6M/1Y/All pills (no per-click fetch; all ranges in response), PMS/AIF corner tag. List view = table with Actions (Performance, Invest More). ≤40rem: single card carousel, toggle hidden.
- AIF Top-up: collapsed summary row ↔ expanded sidebar + unit-class table (tick rows, Make Payment), smooth Collapse animation.
- AIF Redemption: per-unit Full/Partial radios; Full amount = invested value, Partial input capped at invested value; Total Redemption Amount; Redeem disabled until total > 0 and no empty Partial.

- My Strategies cards: 280px wide (`CARD_W`), side padding `PX=10.5`, stretch to equal height. AIF rows (`strategy.aif` from API fields folio/category/absReturn/absReturnPct/trend/navDate/nav) render `AifStrategyCard` (own component, shares `StrategyCardShell` with `PmsStrategyCard`): Folio+CAT chips, Invested/AUM tiles, Abs. Return + sparkline, As on Date | NAV, View Statement / Top up. Screenshot scale for this section is 1.77 (CSS px = image px / 1.77).

## Reports page behaviours (user-driven rules)
- **Use the shared `DialogShell` for every dialog** (Advanced Options, "Start a new report?" confirm, RD file). The user asked for this repeatedly; don't build separate dialog chrome.
- PMS flow: sections 2–4 reveal progressively with fade-up + smooth scroll; X on "Report details" opens ConfirmDialog ("Start a new report?" / Keep report / Reset report); confirming fades sections out (.35s) then resets everything (holder kept). Advance Options appears on every selected report; applied values are sent as `advanced_options` in the generate request.
- Holder and DI-code are dropdowns side by side on desktop; DI codes come from `GET /api/reports/holders/:id/di-codes`. API panels show holders, di-codes, catalog, advanced-options, request body, response.
- AIF tab: only ONE report selectable at a time (tiles look like checkboxes, behave like radios); criteria (consolidate by + from/to dates) appear only for SOA and are required before the download buttons enable; card/criteria use MUI Collapse with `EASE = cubic-bezier(.2,.7,.2,1)`; tab switches fade in (PMS stepper fades opacity-only so sticky still works).
- Product toggle: 141×44, pills PMS 72 / AIF 61 wide, 12px bold. Sticky stepper must stay a direct child of the page container.
- All animations should be smooth (user rule): prefer Collapse/keyframe fades with respect for `prefers-reduced-motion`.
- Not built: mobile app header (hamburger/logo/avatar) from the reports screenshots; the user's screen-recording of the reset animation couldn't be read (macOS temp file gone), so the reset fade is my own design.
- `RadioOption.tsx` had a pre-existing bug (single-quoted `'${...}'` border) — fixed.

## Not done / ideas for next session
- Wire unconnected actions: My Strategy `Performance` / `Invest More`, AIF `Make Payment`, AIF `Redeem` (handlers exist as props, nothing attached), table filter icon is decorative.
- Not verified: narrow-screen layouts of the AIF cards, skeleton swap on mobile, side-panel sticky behaviour on short viewports, animation smoothness (couldn't observe in a background tab).
- Mock delays: PMS 600/450/750ms, others 500ms, dialogs 400ms (a temporary 60s hold was used to inspect skeletons, then reverted).
- Open question from user: AIF redemption screenshot showed the Redeem footer scrolling with the table; I kept it fixed under the table.
- Possible cleanup: `AifCardShell` still lives in AifTopupCard.tsx (could move to common/); `ViewToggle`/`HScroller` still inside MyStrategiesSection.
- Unused-file audit (no source file is orphaned). Deletion candidates awaiting user's yes: `src/assets/{hero.png,react.svg,vite.svg}`, `public/icons.svg`, stale `MyStrategiesData` type, and the default Vite `README.md` (replace with project README).
- Theme note: screens keep their measured colours under `tokens.pms` (e.g. maroon `#7a1f20`) instead of the pasted palette's `#93161E`, to avoid visual shifts; the MUI palette uses the pasted tokens. `zIndex.tooltip: 150` and breakpoint `2xl` are intentionally not passed to MUI.
