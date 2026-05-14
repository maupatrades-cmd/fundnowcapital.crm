# Supabase

Migrations applied to project `gvtrfbhnldbstitdmrqi` (eu-west-1).

These SQL files are the source of truth for the database schema. They were applied via the Supabase MCP and are mirrored here so the repo is self-contained.

## Apply order
1. `001_setup_encryption.sql` — `app` schema, Vault-backed PII encryption helpers, `set_updated_at` trigger
2. `002_profiles.sql` — `profiles` + auth.users → profiles trigger, `app.is_admin()`
3. `003_businesses_directors.sql` — `businesses`, `directors` (encrypted bank acct + ID)
4. `004_funders.sql` — `funders` reference table
5. `005_leads_submissions.sql` — `leads` (with `FNC-XXX0000` ref code generator), `funder_submissions`
6. `006_commissions_bridgement.sql` — `commissions`, `bridgement_book_size` + tier auto-recompute, `business_funding_referrals`
7. `007_documents.sql` — `documents`
8. `008_tasks_calendar_messages.sql` — `tasks`, `calendar_events`, `messages`
9. `009_audit_log.sql` — `audit_log` + triggers on leads/businesses/documents/commissions
10. `010_rls_policies.sql` — RLS on every table; admin policies + client-scoped read policies
11. `011_seed_funders.sql` — Seeds the 14 funders per SPEC.md §4
12. `012_storage_buckets.sql` — Storage buckets (client-documents, funder-submissions, signed-agreements) + policies
13. `013_dashboard_stats_rpc.sql` — `public.dashboard_stats()` aggregation RPC
14. `014_fix_function_search_paths.sql` — Pin `search_path` on remaining functions
