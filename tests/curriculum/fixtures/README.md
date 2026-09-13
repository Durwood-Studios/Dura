# Career coverage regression fixtures

These JSON files preserve the September 2026 review's exact historical topic set, semantic role classification and final adjacent-career additions. They were copied byte-for-byte from the local review reports; tests must depend on these versioned fixtures rather than ignored author-workspace reports.

- `career-unlinked-requirements.json`: original 106 missing-topic identifiers.
- `career-gap-classification.json`: the same historical topics classified by role, level and published path destination, with final introductory study coverage.
- `adjacent-career-closure.json`: exact 48 lesson additions, 56 assessment additions and 64 adjacent-topic mappings in the final batch.

Keep the historical subset intact when adding later lessons. These fixtures describe introductory study coverage, not independent professional certification.
