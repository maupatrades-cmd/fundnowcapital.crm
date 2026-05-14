-- 014 — Pin search_path on remaining functions (advisor 0011)
alter function app.set_updated_at() set search_path = '';
alter function app.recompute_bridgement_tier() set search_path = '';
alter function app.trg_recompute_bridgement_tier() set search_path = '';
alter function app.generate_ref_code() set search_path = '';
alter function app.set_lead_ref_code() set search_path = '';
