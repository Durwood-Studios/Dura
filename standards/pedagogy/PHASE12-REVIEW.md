# Phase 12 low-latency curriculum review

Reviewed 2026-09-12. All **30 lessons** now compile as MDX and pass the current structural LP audit. Each has explicit canonical prerequisites, topic-specific outcomes, guided practice, and a competency check matching its declared level. Native C++ tasks use written code/reasoning with model responses rather than pretending a JavaScript sandbox executes C++. The historical LP baseline remains unchanged.

## Substantive repairs

- Corrected the false claim that `183.50` is inexact in binary64; it is exactly `367/2`. Replaced unchecked fixed-point parsing with full-input, scale, sign-policy, and overflow validation.
- Repaired raw-storage examples: zero/invalid alignment, overflow, null-pointer arithmetic, stale pool handles, duplicate releases, constructor-failure bookkeeping, and erased-callable empty/move behavior. A PMR example now explicitly rejects upstream growth instead of silently claiming it cannot allocate.
- Distinguished permitted NRVO, parsing versus discarded template instantiation, and syntactic concepts versus behavioral guarantees. Removed unsupported universal dispatch, SIMD speedup, allocation-cost, and industry-practice claims.
- Corrected numeric, protocol, and measurement distinctions: compensated summation is not universally exact; TSC is not the changing turbo clock; RDTSCP is not fully serializing; io_uring still submits operations to the kernel; FIX counts octets and actual SOH delimiters.
- Replaced malformed object-valued quiz options with supported string options and explicit answer indices. Converted unsupported raw TeX expressions into readable MDX-safe notation.
- Corrected finance assessments that annualized per-trade ratios as daily returns, claimed arbitrary diversification always improves Sharpe, or treated historical pair behavior as guaranteed reversion. Added expiry/zero-volatility validation to the pricing example and corrected the `N(d1)` versus `N(d2)` interpretation.
- Fixed a malformed fill-in prompt and the shared placeholder splitter. Long underscore runs now represent one blank and preserve the placement of later blanks.

## Verification

`npx vitest run tests/paths/phase12-content.test.ts tests/learning/fill-blank-placeholders.test.ts tests/standards/lp-1-conformance.test.ts` checks structural contracts, MDX compilation, explicit prerequisites, supported quiz properties, and usable blank placement. The recap checker now counts only the recap section, with a regression proving later continuation bullets do not distort its count.

`node scripts/check-phase12-native.mjs` extracts six **actual lesson C++ blocks** and compiles them with a C++20 compiler, strict warnings, AddressSanitizer, and UndefinedBehaviorSanitizer. It verifies conditional null checks and exercises price-parser rejection/range boundaries, fixed/dynamic arena alignment and exhaustion, pool lifetime/stale-handle behavior, and erased-callable movement/empty calls. It passed locally with clang++. This optional native check requires an installed compiler; it does not install packages or run code in a learner's browser.

These checks do not demonstrate live exchange connectivity, full venue-protocol coverage, profitable strategies, universal performance bounds, or external professional certification. The broader exploratory NumPy/SciPy examples require their documented native Python environment; they are not browser-executed assessments. No trading orders or production configuration were changed.

## Primary sources

- [C++ working draft: copy elision](https://eel.is/c++draft/class.copy.elision) [conditional evaluation](https://eel.is/c++draft/expr.cond), and [if statements](https://eel.is/c++draft/stmt.if): language rules.
- [C++23 working draft](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2023/n4950.pdf): object lifetime and polymorphic memory resources.
- [Google Benchmark guide](https://github.com/google/benchmark/blob/main/docs/user_guide.md): observable benchmark work and optimization limits.
- [Intel instruction reference](https://www.intel.com/content/dam/www/public/us/en/documents/manuals/64-ia-32-architectures-software-developer-vol-2b-manual.pdf): timestamp ordering requirements.
- [io_uring design](https://www.kernel.dk/io_uring.pdf): kernel submission and completion structures.
- [Nasdaq TotalView ITCH](https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/Totalview-ITCH-cloud.pdf) and [OUCH protocol overview](https://classic.nasdaqtrader.com/Trader.aspx?id=ouch): market-data/order-entry separation.
- [FIX TagValue encoding](https://www.fixtrading.org/standards/tagvalue-online/): byte framing and checksum boundaries.
- [MIT risk-neutral valuation notes](https://ocw.mit.edu/courses/18-642-topics-in-mathematics-with-applications-in-finance-fall-2024/mit18_642_f24_lec21.pdf): model assumptions and pricing interpretation.
- [Basel market-risk standard](https://www.bis.org/publications/201901-standards-minimum-capital-requirements-market-risk): bounded regulatory context for expected shortfall.
