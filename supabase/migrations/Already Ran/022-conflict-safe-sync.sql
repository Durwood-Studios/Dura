-- Manual proposal. Requires inspection against the actual project before application.
-- Preserves newer mutable records and propagates explicit deletions without stale resurrection.
BEGIN;
ALTER TABLE public.goals ADD COLUMN phase_id text, ADD COLUMN role_id text;
CREATE TABLE public.learner_tombstones (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name text NOT NULL CHECK (table_name IN ('flashcards','goals','sandbox_saves')),
  record_id text NOT NULL,
  deleted_at bigint NOT NULL,
  PRIMARY KEY(user_id, table_name, record_id)
);
ALTER TABLE public.learner_tombstones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own tombstones" ON public.learner_tombstones FOR SELECT TO authenticated USING(user_id=auth.uid());
GRANT SELECT ON public.learner_tombstones TO authenticated;
ALTER TABLE public.lesson_progress ADD COLUMN activity_evidence jsonb NOT NULL DEFAULT '{}'::jsonb, ADD COLUMN daily_time_ms jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE FUNCTION public.sync_learner_records(p_table text, p_rows jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE incoming jsonb; existing jsonb; merged jsonb; incoming_id text; cols text; vals text; owner uuid:=auth.uid();
BEGIN
 IF owner IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF p_table NOT IN ('flashcards','goals','sandbox_saves','tutorial_progress') THEN RAISE EXCEPTION 'Unsupported sync table'; END IF;
 IF jsonb_typeof(p_rows) IS DISTINCT FROM 'array' OR jsonb_array_length(p_rows)>1000 THEN RAISE EXCEPTION 'Invalid sync batch'; END IF;
 FOR incoming IN SELECT value FROM jsonb_array_elements(p_rows) LOOP
  IF incoming->>'user_id' IS DISTINCT FROM owner::text THEN RAISE EXCEPTION 'Owner mismatch'; END IF;
  incoming_id:=incoming->>'id';
  IF incoming_id IS NULL OR length(incoming_id)>500 THEN RAISE EXCEPTION 'Invalid record identity'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(owner::text||p_table||incoming_id,0));
  IF EXISTS(SELECT 1 FROM public.learner_tombstones WHERE user_id=owner AND table_name=p_table AND learner_tombstones.record_id=incoming_id) THEN CONTINUE; END IF;
  incoming:=incoming||jsonb_build_object('user_id',owner);
  EXECUTE format('SELECT to_jsonb(t) FROM public.%I t WHERE user_id=$1 AND id::text=$2 FOR UPDATE',p_table) INTO existing USING owner,incoming_id;
  merged:=incoming;
  IF existing IS NOT NULL THEN
   IF p_table='flashcards' AND coalesce((existing->>'last_review')::bigint,0)>=coalesce((incoming->>'last_review')::bigint,0) THEN CONTINUE;
   ELSIF p_table='sandbox_saves' AND (existing->>'updated_at')::bigint>=(incoming->>'updated_at')::bigint THEN CONTINUE;
   ELSIF p_table='tutorial_progress' AND (existing->>'last_active_at')::bigint>=(incoming->>'last_active_at')::bigint THEN CONTINUE;
   ELSIF p_table='goals' THEN
    merged:=existing||jsonb_build_object('current',greatest((existing->>'current')::numeric,(incoming->>'current')::numeric));
    -- JSON null must not erase an already achieved goal.
    merged:=jsonb_set(merged,'{achieved_at}',CASE WHEN existing->>'achieved_at' IS NOT NULL THEN existing->'achieved_at' ELSE incoming->'achieved_at' END);
   END IF;
  END IF;
  SELECT string_agg(format('%I',key),','),string_agg(format('%I=EXCLUDED.%I',key,key),',') FILTER (WHERE key NOT IN ('user_id','id')) INTO cols,vals FROM jsonb_object_keys(merged) key;
  EXECUTE format('INSERT INTO public.%1$I (%2$s) SELECT %2$s FROM jsonb_populate_record(NULL::public.%1$I,$1) ON CONFLICT(user_id,id) DO UPDATE SET %3$s',p_table,cols,vals) USING merged;
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.sync_learner_records(text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_learner_records(text,jsonb) TO authenticated;

CREATE FUNCTION public.delete_learner_record(p_user_id uuid,p_table text,p_id text,p_deleted_at bigint) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE owner uuid:=auth.uid();
BEGIN
 IF owner IS NULL OR p_user_id IS DISTINCT FROM owner THEN RAISE EXCEPTION 'Owner mismatch'; END IF;
 IF p_table NOT IN ('flashcards','goals','sandbox_saves') OR p_id IS NULL OR length(p_id)>500 OR p_deleted_at<0 THEN RAISE EXCEPTION 'Invalid deletion'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(owner::text||p_table||p_id,0));
 INSERT INTO public.learner_tombstones VALUES(owner,p_table,p_id,p_deleted_at) ON CONFLICT(user_id,table_name,record_id) DO NOTHING;
 EXECUTE format('DELETE FROM public.%I WHERE user_id=$1 AND id::text=$2',p_table) USING owner,p_id;
END $$;
REVOKE ALL ON FUNCTION public.delete_learner_record(uuid,text,text,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_learner_record(uuid,text,text,bigint) TO authenticated;
CREATE FUNCTION public.sync_progress_v2(p_user_id uuid,p_data jsonb) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE item jsonb; activity record; saved jsonb; days jsonb;
BEGIN
 IF p_user_id IS DISTINCT FROM auth.uid() OR auth.uid() IS NULL THEN RAISE EXCEPTION 'Owner mismatch'; END IF;
 IF jsonb_typeof(p_data) IS DISTINCT FROM 'array' OR jsonb_array_length(p_data)>1000 THEN RAISE EXCEPTION 'Invalid progress batch'; END IF;
 PERFORM public.sync_progress(p_user_id,p_data);
 FOR item IN SELECT value FROM jsonb_array_elements(p_data) LOOP
  IF jsonb_typeof(coalesce(item->'activityEvidence','{}'))<>'object' OR octet_length(coalesce(item->'activityEvidence','{}')::text)>1000000 THEN RAISE EXCEPTION 'Invalid activity evidence'; END IF;
  SELECT activity_evidence INTO saved FROM public.lesson_progress WHERE user_id=p_user_id AND lesson_id=item->>'lessonId' FOR UPDATE;
  FOR activity IN SELECT key,value FROM jsonb_each(coalesce(item->'activityEvidence','{}')) LOOP
   IF saved->activity.key IS NULL OR (activity.value->>'updatedAt')::numeric > (saved->activity.key->>'updatedAt')::numeric THEN saved:=jsonb_set(saved,ARRAY[activity.key],activity.value); END IF;
  END LOOP;
  SELECT daily_time_ms INTO days FROM public.lesson_progress WHERE user_id=p_user_id AND lesson_id=item->>'lessonId';
  FOR activity IN SELECT key,value FROM jsonb_each(coalesce(item->'dailyTimeMs','{}')) LOOP
   IF activity.key !~ '^\d{4}-\d{2}-\d{2}$' OR (activity.value::text)::numeric NOT BETWEEN 0 AND 86400000 THEN RAISE EXCEPTION 'Invalid daily study time'; END IF;
   days:=jsonb_set(days,ARRAY[activity.key],to_jsonb(greatest(coalesce((days->>activity.key)::numeric,0),(activity.value::text)::numeric)));
  END LOOP;
  UPDATE public.lesson_progress SET activity_evidence=saved,daily_time_ms=days WHERE user_id=p_user_id AND lesson_id=item->>'lessonId';
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.sync_progress_v2(uuid,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_progress_v2(uuid,jsonb) TO authenticated;
-- Older clients must not bypass the version/tombstone contract. Local learning
-- continues, but their old cloud upserts fail until the matching frontend ships.
REVOKE INSERT,UPDATE,DELETE ON public.flashcards,public.goals,public.sandbox_saves,public.tutorial_progress FROM PUBLIC,anon,authenticated;
COMMIT;
