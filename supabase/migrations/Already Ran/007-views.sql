-- 007-views.sql
-- Read views for aggregated data

-- user_stats view lives in 014-reconciliation.sql (depends on streaks created there)

-- ============================================================
-- phase_completion
-- Per-user phase completion status: how many lessons done
-- out of total, and whether the verification cert exists.
-- ============================================================
create or replace view public.phase_completion as
select
  lp.user_id,
  lp.phase_id,
  count(*) filter (where lp.completed_at is not null) as completed_lessons,
  count(*)                                             as total_lessons,
  round(
    count(*) filter (where lp.completed_at is not null)::numeric
    / nullif(count(*), 0) * 100, 1
  )                                                    as completion_pct,
  bool_or(c.id is not null)                            as has_certificate
from public.lesson_progress lp
left join public.certificates c
  on c.user_id = lp.user_id and c.phase_id = lp.phase_id
group by lp.user_id, lp.phase_id;


-- ============================================================
-- leaderboard
-- Anonymized top learners by XP. Display names only, no emails
-- or user IDs exposed. For optional future gamification.
-- ============================================================
create or replace view public.leaderboard as
select
  p.display_name,
  coalesce(xp.total_xp, 0)                        as total_xp,
  floor(sqrt(coalesce(xp.total_xp, 0) / 100.0))   as level,
  coalesce(lp.lessons_completed, 0)                 as lessons_completed
from public.profiles p
inner join (
  select user_id, sum(amount) as total_xp
  from public.xp_events
  group by user_id
) xp on xp.user_id = p.id
left join (
  select user_id, count(*) filter (where completed_at is not null) as lessons_completed
  from public.lesson_progress
  group by user_id
) lp on lp.user_id = p.id
order by xp.total_xp desc
limit 100;
