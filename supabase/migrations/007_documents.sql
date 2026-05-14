-- 007 — documents
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  client_id uuid references public.profiles(id) on delete set null,
  category text not null check (category in (
    'id_document','proof_of_address','bank_statements','financial_statements',
    'management_accounts','cipc_documents','tax_clearance','vat_certificate',
    'application_form','purchase_order','supplier_quote','invoice',
    'signed_agreement','other'
  )),
  document_name text not null,
  storage_path text not null,
  file_size_kb int,
  mime_type text,
  review_status text not null default 'pending' check (review_status in ('pending','accepted','needs_replacement')),
  review_notes text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now()
);

create index documents_lead_id_idx on public.documents(lead_id);
create index documents_business_id_idx on public.documents(business_id);
create index documents_client_id_idx on public.documents(client_id);
create index documents_category_idx on public.documents(category);
