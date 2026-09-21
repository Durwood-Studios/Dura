-- ============================================================
-- DURA: Infrastructure — missing FK index
-- ============================================================

-- annotation_votes.user_id has a foreign key constraint but no index.
-- Without this, any JOIN or filter on user_id triggers a seq scan.
CREATE INDEX IF NOT EXISTS annotation_votes_user_id_idx
  ON public.annotation_votes (user_id);
