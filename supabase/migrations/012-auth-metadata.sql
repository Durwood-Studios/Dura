-- 012-auth-metadata.sql
-- Helper function to store user preferences in auth.users.raw_user_meta_data.
--
-- WHY auth metadata instead of a separate preferences table?
--   1. Preferences load instantly on sign-in — they're part of the JWT/session
--   2. No extra query needed on app boot
--   3. Supabase returns raw_user_meta_data in the session object automatically
--   4. One fewer table to manage RLS policies on
--
-- The function merges provided values into a nested "preferences" key,
-- preserving any existing preferences that aren't being updated.
-- Pass null for any parameter you don't want to change.
--
-- Usage from the client:
--   await supabase.rpc('update_user_preferences', {
--     p_theme: 'light',
--     p_daily_goal_minutes: 30
--   });

create or replace function public.update_user_preferences(
  p_theme              text    default null,
  p_font_size          text    default null,
  p_study_mode         text    default null,
  p_reduced_motion     boolean default null,
  p_high_contrast      boolean default null,
  p_dyslexia_font      boolean default null,
  p_daily_goal_minutes int     default null
)
returns void
language plpgsql
security definer  -- Required to write to auth.users
as $$
declare
  current_meta jsonb;
  prefs        jsonb;
begin
  -- Fetch the user's current metadata
  select raw_user_meta_data
    into current_meta
    from auth.users
   where id = auth.uid();

  -- Extract existing preferences (or start with empty object)
  prefs := coalesce(current_meta -> 'preferences', '{}'::jsonb);

  -- Merge only the non-null parameters into the preferences object
  if p_theme is not null then
    prefs := prefs || jsonb_build_object('theme', p_theme);
  end if;

  if p_font_size is not null then
    prefs := prefs || jsonb_build_object('fontSize', p_font_size);
  end if;

  if p_study_mode is not null then
    prefs := prefs || jsonb_build_object('studyMode', p_study_mode);
  end if;

  if p_reduced_motion is not null then
    prefs := prefs || jsonb_build_object('reducedMotion', p_reduced_motion);
  end if;

  if p_high_contrast is not null then
    prefs := prefs || jsonb_build_object('highContrast', p_high_contrast);
  end if;

  if p_dyslexia_font is not null then
    prefs := prefs || jsonb_build_object('dyslexiaFont', p_dyslexia_font);
  end if;

  if p_daily_goal_minutes is not null then
    prefs := prefs || jsonb_build_object('dailyGoalMinutes', p_daily_goal_minutes);
  end if;

  -- Write the updated preferences back into the user's metadata,
  -- preserving all other top-level metadata keys (display_name, avatar_url, etc.)
  update auth.users
     set raw_user_meta_data = coalesce(current_meta, '{}'::jsonb)
                              || jsonb_build_object('preferences', prefs)
   where id = auth.uid();
end;
$$;
