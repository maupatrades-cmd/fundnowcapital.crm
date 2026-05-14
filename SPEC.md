# Fund Now Capital — CRM + Client Portal
## Claude Code Build Prompt (Complete Specification)

---

## 1. PROJECT OVERVIEW

Build a production-grade web application for **Fund Now Capital (Pty) Ltd** — a South African alternative business funding brokerage (CIPC: 2026/066284/07). The application has TWO surfaces:

**A. Internal CRM (Admin — Thapelo Maupa, sole user for now)**
- Lead capture & management
- Per-client document vault
- Funder routing & submission tracking
- Commission calculator (all 13 funders, all rules)
- Calendar, tasks, follow-up reminders
- Personal referral tracking (Marketing iO consultants)
- Email integration (info@fundnowcapital.africa, thapelol@fundnowcapital.africa)

**B. Client Portal (Self-service for FNC clients)**
- Sign-up with OTP (SMS + email)
- Full funding application
- Document upload (KYC, financials, business)
- Real-time application status tracking
- Messaging with broker
- View signed agreements / quotes

**Domains:**
- Client portal: `portal.fundnowcapital.africa`
- Internal CRM: `crm.fundnowcapital.africa` (admin login only)
- Marketing site: `www.fundnowcapital.africa` (existing — Apply button must redirect to portal)

**Compliance:** POPIA. EU region or SA-aligned. Encrypted at rest. Audit logs. Bank account fields encrypted. Consent capture on signup.

---

## 2. TECH STACK

- **Frontend:** React + Vite + TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Storage, Row Level Security, Edge Functions) — **EU region**
- **OTP:** Twilio Verify (SMS) + Supabase Auth (email magic link). Both required for client signup.
- **Email:** Resend.com (transactional) — sender: `noreply@fundnowcapital.africa`
- **File storage:** Supabase Storage buckets (`client-documents`, `funder-submissions`, `signed-agreements`)
- **Deployment:** Vercel (frontend) + Supabase Cloud (backend)
- **Domain:** Point `portal.fundnowcapital.africa` and `crm.fundnowcapital.africa` via Cloudflare → Vercel

---

## 3. DATABASE SCHEMA (Supabase Postgres)

```sql
-- USERS (extends auth.users)
profiles (
  id uuid PK references auth.users,
  role text check (role in ('admin', 'client', 'consultant')),
  full_name text,
  phone text,
  email text,
  id_number text encrypted,
  province text,
  created_at timestamptz default now()
)

-- CLIENTS / BUSINESSES
businesses (
  id uuid PK,
  client_id uuid references profiles(id),
  trading_name text,
  registered_name text,
  cipc_number text,
  vat_number text,
  industry text,
  province text,
  city text,
  trading_address text,
  years_trading numeric,
  monthly_turnover numeric,
  annual_turnover numeric,
  num_employees int,
  bank_name text,
  bank_account_number text encrypted,
  bank_branch_code text,
  business_logo_url text,
  description text,
  created_at timestamptz default now()
)

-- DIRECTORS / SHAREHOLDERS
directors (
  id uuid PK,
  business_id uuid references businesses(id),
  full_name text,
  id_number text encrypted,
  role text, -- Director, Member, Shareholder
  shareholding_pct numeric,
  email text,
  phone text,
  is_signatory boolean default false
)

-- LEADS / APPLICATIONS
leads (
  id uuid PK,
  ref_code text unique, -- FNC-XXXX0000
  client_id uuid references profiles(id),
  business_id uuid references businesses(id),
  source text check (source in ('client_portal', 'admin_manual', 'consultant_referral', 'marketing_io', 'website_form')),
  consultant_id uuid references profiles(id) null, -- if from Marketing iO
  funding_type text check (funding_type in (
    'working_capital', 'merchant_cash_advance', 'purchase_order_finance',
    'invoice_discounting', 'asset_finance', 'equipment_finance',
    'property_finance', 'bridging_finance', 'growth_capital'
  )),
  funding_amount numeric,
  funding_purpose text,
  has_existing_finance boolean,
  existing_finance_details text,
  status text check (status in (
    'new', 'documents_pending', 'under_review', 'submitted_to_funder',
    'funder_review', 'approved', 'declined', 'disbursed', 'closed_lost'
  )) default 'new',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)

-- FUNDER SUBMISSIONS (one lead can go to multiple funders)
funder_submissions (
  id uuid PK,
  lead_id uuid references leads(id),
  funder_id text references funders(id),
  submitted_at timestamptz,
  submitted_by uuid references profiles(id),
  status text check (status in (
    'preparing', 'submitted', 'in_credit_review', 'request_info',
    'approved', 'declined', 'funded', 'expired'
  )),
  funder_reference text,
  funded_amount numeric null,
  funded_at date null,
  margin_or_fee numeric null, -- for Swype (margin) and Better Banc (flat fee)
  decline_reason text null,
  notes text
)

-- FUNDERS (reference table — seeded)
funders (
  id text PK,
  name text,
  active boolean default true,
  funding_types text[], -- array
  min_amount numeric,
  max_amount numeric,
  min_turnover numeric,
  min_trading_months int,
  turnaround_hours int,
  commission_basis text check (commission_basis in (
    'pct_funded', 'pct_margin', 'pct_interest', 'pct_profit',
    'flat_per_approval', 'tiered_funded', 'pct_their_commission'
  )),
  commission_rate numeric, -- the headline rate
  commission_notes text,
  contact_email text,
  contact_phone text,
  partnership_manager text,
  contract_signed boolean default false,
  contract_url text
)

-- COMMISSIONS (one per funded deal, calculated on funding)
commissions (
  id uuid PK,
  lead_id uuid references leads(id),
  funder_submission_id uuid references funder_submissions(id),
  funder_id text references funders(id),
  funded_amount numeric,
  basis text, -- copied from funder
  rate numeric, -- effective rate used (may differ from headline if tier-based)
  base_amount numeric, -- the amount the rate applies to (funded / margin / interest / profit)
  gross_commission numeric, -- base_amount * rate
  vat_inclusive boolean default true,
  net_commission numeric, -- ex VAT (15%)
  per_approval_bonus numeric default 0, -- Bridgement R500/R1000/R2000
  total_due numeric,
  invoice_number text,
  invoice_issued_at date,
  expected_payment_date date,
  paid_at date null,
  paid_amount numeric null,
  payment_reference text,
  status text check (status in ('pending', 'invoiced', 'overdue', 'paid', 'short_paid', 'disputed')) default 'pending',
  notes text
)

-- DOCUMENTS
documents (
  id uuid PK,
  lead_id uuid references leads(id) null,
  business_id uuid references businesses(id) null,
  client_id uuid references profiles(id),
  category text check (category in (
    'id_document', 'proof_of_address', 'bank_statements', 'financial_statements',
    'management_accounts', 'cipc_documents', 'tax_clearance', 'vat_certificate',
    'application_form', 'purchase_order', 'supplier_quote', 'invoice',
    'signed_agreement', 'other'
  )),
  document_name text,
  file_url text,
  file_size_kb int,
  mime_type text,
  uploaded_by uuid references profiles(id),
  uploaded_at timestamptz default now(),
  notes text
)

-- TASKS
tasks (
  id uuid PK,
  lead_id uuid references leads(id) null,
  assigned_to uuid references profiles(id),
  title text,
  description text,
  due_date timestamptz,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')),
  status text check (status in ('todo', 'in_progress', 'done', 'cancelled')) default 'todo',
  completed_at timestamptz null,
  created_at timestamptz default now()
)

-- CALENDAR EVENTS
calendar_events (
  id uuid PK,
  user_id uuid references profiles(id),
  lead_id uuid references leads(id) null,
  title text,
  description text,
  start_time timestamptz,
  end_time timestamptz,
  event_type text check (event_type in ('meeting', 'call', 'follow_up', 'submission_deadline', 'payment_due', 'personal')),
  reminder_minutes_before int default 30,
  created_at timestamptz default now()
)

-- MESSAGES (client ↔ broker)
messages (
  id uuid PK,
  lead_id uuid references leads(id),
  sender_id uuid references profiles(id),
  recipient_id uuid references profiles(id),
  body text,
  read_at timestamptz null,
  created_at timestamptz default now()
)

-- AUDIT LOG (POPIA)
audit_log (
  id uuid PK,
  user_id uuid references profiles(id),
  action text,
  entity_type text,
  entity_id uuid,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
)

-- BRIDGEMENT BOOK SIZE TRACKER (for tier progression)
bridgement_book_size (
  id uuid PK,
  cumulative_funded numeric,
  current_tier text check (current_tier in ('Bronze', 'Silver', 'Gold')),
  last_updated timestamptz default now()
)

-- BUSINESS FUNDING REFERRALS (45% share)
business_funding_referrals (
  id uuid PK,
  lead_id uuid references leads(id),
  their_funder_used text, -- which funder Business Funding actually used
  their_commission_amount numeric,
  our_share_pct numeric default 45,
  our_commission numeric, -- their_commission * 0.45
  status text,
  paid_at date null
)
```

**Row Level Security (RLS) — critical:**
- Clients can only see their own `businesses`, `leads`, `documents`, `messages`.
- Admin (Thapelo) sees everything.
- Consultants see only leads where `consultant_id = auth.uid()`.

---

## 4. FUNDER PANEL — SEED DATA (HARDCODE THIS EXACTLY)

The CRM must ship with these 13 funders pre-loaded. Commission calculator MUST use these rules:

| Funder ID | Name | Basis | Rate | Notes |
|---|---|---|---|---|
| `swype` | Swype Financial Services | `pct_margin` | 12% | Of the margin (future receivables − purchase price). Contract signed 28 April 2026. |
| `pollen` | Pollen Finance | `pct_interest` | 10% first deal, 5% recurring 24mo | Of interest only. Contract signed 28 April 2026. |
| `bridgement` | Bridgement | `tiered_funded` | 3% / 5% / 5.5% + R500/R1000/R2000 | Bronze (book < R1M): 3% + R500/approval. Silver (book R1M–R4M): 5% + R1000/approval. Gold (book ≥ R4M): 5.5% + R2000/approval. Paid first week of month. Current tier: **Bronze**. Partnership manager: Harry Wheeler (harry@bridgement.com, 076 700 2532). |
| `better_banc` | Better Banc | `pct_funded` | 3% | Flat fee model. Funds R20k–R1.5M. Renier is contact. |
| `genfin` | GenFin | `pct_funded` | 7% (est) | Same-day payout. R1M+ turnover required. R5M max. Confirm rate. |
| `merchant_capital` | Merchant Capital | `pct_funded` | 8% (Tier 1, VAT inclusive) | Tiered by cumulative funded volume. Weekly Tuesday 4pm submission cutoff. 3-month source rule applies on unfunded deals. Channel Ops: Jenna Bennett. |
| `growise` | Growise Capital | `pct_margin` | 8% (est) | Confirm rate. |
| `sourcefin` | Sourcefin | `pct_profit` | 8.5% | **PO + invoice finance. Paid ONLY after supplier delivered AND Sourcefin made profit.** E.g. Sourcefin makes R30,000 profit → Thapelo gets 8.5% = R2,550. R150M backed. R100k–R50M+. |
| `rockfin` | Rockfin | `pct_funded` | 6% (est) | Working capital. Confirm rate. |
| `business_partners` | Business Partners Limited | `pct_funded` | 2% (est) | Growth + property. R500k–R50M. 5–10 day turnaround. |
| `centrafin` | Centrafin | `pct_funded` | 4% (est) | Asset & vehicle finance. Confirm rate. |
| `steed_finance` | Steed Finance | `pct_funded` | 4% (est) | Equipment finance. Confirm rate. |
| `unihina` | Unihina | `flat_per_approval` | R500–R5000 (capped) | Purchase order. Flat fee per approval, capped. Then funds the client. |
| `business_funding` | Business Funding | `pct_their_commission` | 45% | **45% of THEIR commission**. They use their own funders (not on our panel — Pollen and the likes excluded). Profit range R500–R10,000 per deal. |

**Tag each funder with funding_types array** so the system can recommend funders per deal type (e.g. PO deal → Sourcefin, Unihina, Business Funding).

---

## 5. COMMISSION CALCULATOR (THE HEART OF THE CRM)

Build a `calculateCommission(funder_id, deal_data)` function. Deal data includes: `funded_amount`, `margin` (if applicable), `interest_amount` (if applicable), `profit` (Sourcefin), `their_commission` (Business Funding).

**Rules:**

```typescript
function calculateCommission(funderId, deal) {
  const funder = getFunder(funderId);
  let base_amount = 0;
  let rate = funder.commission_rate;
  let per_approval_bonus = 0;
  let effective_rate_label = '';

  switch (funder.commission_basis) {
    case 'pct_funded':
      base_amount = deal.funded_amount;
      break;

    case 'pct_margin':
      base_amount = deal.margin;
      break;

    case 'pct_interest':
      base_amount = deal.interest_amount;
      // Pollen: first deal 10%, recurring 5% — check client history
      if (funderId === 'pollen') {
        const isRecurring = await checkPollenRecurring(deal.client_id);
        rate = isRecurring ? 0.05 : 0.10;
      }
      break;

    case 'pct_profit':
      base_amount = deal.profit; // Sourcefin
      break;

    case 'tiered_funded':
      // Bridgement
      if (funderId === 'bridgement') {
        const bookSize = await getBridgementBookSize();
        if (bookSize < 1_000_000) {
          rate = 0.03; per_approval_bonus = 500; // Bronze
        } else if (bookSize < 4_000_000) {
          rate = 0.05; per_approval_bonus = 1000; // Silver
        } else {
          rate = 0.055; per_approval_bonus = 2000; // Gold
        }
        base_amount = deal.funded_amount;
      }
      break;

    case 'flat_per_approval':
      // Unihina — flat R500–R5000 capped
      return {
        base_amount: 0,
        rate: 0,
        gross: deal.flat_fee || 2500, // admin enters
        per_approval_bonus: 0,
        total: deal.flat_fee || 2500,
        explanation: `Flat fee per approval (Unihina): R${deal.flat_fee}`
      };

    case 'pct_their_commission':
      // Business Funding — 45% of their commission
      base_amount = deal.their_commission;
      rate = 0.45;
      break;
  }

  const gross = base_amount * rate;
  const total = gross + per_approval_bonus;
  const vat = total * 0.15;
  const net = total - vat;

  return {
    funder: funder.name,
    base_amount,
    rate,
    rate_pct: (rate * 100).toFixed(2) + '%',
    gross,
    per_approval_bonus,
    total_vat_inclusive: total,
    vat,
    net_ex_vat: net,
    explanation: buildExplanation(funder, deal, base_amount, rate, per_approval_bonus)
  };
}
```

**The UI must show a "Commission Calculator" page** with:
- Funder dropdown
- Conditional inputs (funded amount / margin / interest / profit / their commission — depending on funder)
- Live calculation with breakdown
- "Add to deal" button to save to a lead

---

## 6. INTERNAL CRM PAGES (Admin side)

### 6.1 Dashboard
- KPI cards: Open leads, Submitted this week, Funded this month, Commission earned MTD, Commission pending
- Pipeline by stage (kanban-style)
- Bridgement book size + tier progress bar (Bronze → Silver: R1M; Silver → Gold: R4M)
- Tasks due today
- Recent client messages

### 6.2 Leads
- List view with filters (status, funder, source, priority, date)
- Add Lead button → opens **New Client Form** (Section 7 below)
- Click row → Lead detail page

### 6.3 Lead Detail
Tabs:
- **Overview** — client info, business info, funding ask
- **Documents** — folder view; upload, label, download, delete
- **Funder Submissions** — table of submissions per funder with status; "Submit to Funder" button generates an email with the document checklist + shareable link
- **Commission** — live calculator + saved commission records
- **Tasks** — tasks tied to this lead
- **Messages** — chat with client
- **Activity Log** — audit trail

### 6.4 Funders
- List of 13 funders with edit dialog (rate, contact, status)
- Per-funder analytics: deals submitted, approval rate, total commission earned

### 6.5 Calendar
- Monthly + weekly view
- Event types colour-coded
- Auto-populated: submission deadlines, payment due dates, follow-ups

### 6.6 Commission Tracker
- All commissions list (status: pending, invoiced, paid)
- Monthly summary
- Invoice generator (PDF) for each commission
- Export to CSV

### 6.7 Consultants (Marketing iO referrals)
- List of consultants (Marketing iO field agents)
- Their referral count, funded count, commission generated
- Their referral commission owed (set per consultant)

### 6.8 Settings
- Profile (Thapelo)
- Business details (Fund Now Capital)
- Email templates (submission email, client onboarding, document request)
- Funder rates (edit headline rates)
- Banking details for invoicing (Absa, branch 632005, account 4125798855)

---

## 7. NEW CLIENT FORM (Admin manual capture)

A multi-step form with these EXACT fields. **All fields must save to the right table.**

### Step 1: Personal Details (saves to `profiles`)
- Full Name *
- ID Number * (encrypt at rest)
- Mobile Number *
- Email *
- Province * (dropdown: 9 SA provinces)
- Physical Address
- Marital Status (Single / Married COP / Married ANC / Divorced / Widowed)

### Step 2: Business Details (saves to `businesses`)
- Registered Business Name *
- Trading Name (if different)
- CIPC Registration Number * (format: YYYY/NNNNNN/NN)
- VAT Number (if VAT registered)
- Industry * (dropdown: Construction, Mining, Retail, Wholesale, Manufacturing, Transport & Logistics, Hospitality, Professional Services, Medical & Healthcare, Agriculture, Education, IT & Telecom, Other)
- Date Business Started *
- Number of Employees
- Trading Address *
- Province *
- City *
- Operating Address (if different from trading)
- Business Description (textarea)
- Business Logo (file upload, optional)

### Step 3: Financial Profile
- Monthly Turnover (R) *
- Annual Turnover (R) * (auto-calc or override)
- Monthly Net Profit (R)
- Bank Name * (dropdown: Absa, FNB, Standard Bank, Nedbank, Capitec, Investec, TymeBank, Bidvest, Other)
- Account Type (Cheque / Savings / Business)
- Account Holder Name
- Bank Account Number * (encrypt)
- Branch Code
- Existing Loans / Finance? (Y/N)
- If yes: Lender + Outstanding Balance + Monthly Repayment

### Step 4: Directors / Shareholders (repeatable group → `directors`)
For each director:
- Full Name *
- ID Number * (encrypt)
- Role (Director / Member / Shareholder)
- Shareholding % *
- Email
- Phone
- Is signatory? (checkbox)

Add Director button to repeat.

### Step 5: Funding Request (saves to `leads`)
- Funding Type * (dropdown of 9 types from schema)
- Amount Required (R) *
- Purpose of Funding * (textarea)
- How soon do you need the funds? (Within 24hrs / 1 week / 2 weeks / 1 month / Flexible)
- Preferred Repayment Term (months)
- Lead Source * (Client Portal / Manual / Consultant Referral / Marketing iO / Website Form)
- If Consultant Referral: Consultant dropdown
- Notes (textarea)
- Priority (Low / Medium / High / Urgent)

### Step 6: Document Checklist (saves to `documents`)
Multi-upload widget with these required categories:
- ☐ South African ID / Passport (all directors)
- ☐ Proof of Address (3 months, all directors)
- ☐ 6 Months Bank Statements (downloaded PDF — NOT scanned)
- ☐ CIPC Documents (CoR14.3, CoR14.1 share certificates, BBBEE)
- ☐ Latest Financial Statements OR Management Accounts (6 months)
- ☐ VAT Certificate (if applicable)
- ☐ Tax Clearance Certificate
- ☐ Signed Application Form (FNC template)
- ☐ Purchase Order (if PO finance)
- ☐ Supplier Quote (if PO finance)
- ☐ Customer Invoice (if invoice discounting)

On submit:
1. Insert into all tables
2. Generate `ref_code` like `FNC-ABC1234`
3. Send welcome email to client with their portal login
4. Create initial task: "Review documents and recommend funders"

---

## 8. CLIENT PORTAL (portal.fundnowcapital.africa)

### 8.1 Sign-up flow with OTP
1. Email + Mobile + Password
2. **SMS OTP** via Twilio Verify → mobile
3. **Email magic link** via Supabase Auth → email
4. Both must verify before account active
5. Accept POPIA consent + T&Cs (checkboxes)
6. Redirect to onboarding

### 8.2 Onboarding (same as Steps 2–5 of admin form but client-facing language)

### 8.3 Client Dashboard
- Application status banner (with progress bar)
- Document upload checklist (live status — admin marks each as Accepted / Needs Replacement)
- Messages from broker
- "Add another business" button
- Profile / security

### 8.4 Application status (visible to client)
- New — "We received your application"
- Documents Pending — "Please upload outstanding documents"
- Under Review — "Our broker is matching you with funders"
- Submitted to Funder — "Your application is with [Funder Name]"
- Funder Review — "The funder is conducting credit checks"
- Approved — "You have been approved!"
- Disbursed — "Funds have been disbursed"
- Declined — "Unfortunately not approved. Broker will contact you."

### 8.5 Document upload (client side)
- Drag-and-drop
- Show checklist with status icons
- File size limit 10MB, accepted: PDF, JPG, PNG
- Re-upload allowed if admin requests replacement

---

## 9. EMAIL TEMPLATES (built-in, editable in Settings)

### 9.1 Funder Submission Email (auto-generated per submission)
When admin clicks "Submit to Funder" on a lead:
- Pre-fills subject: `New Application — [Business Name] — R[Amount] — [Funding Type]`
- Body lists every attached document with checkmark
- Includes shareable secure link (signed URL, 7-day expiry) to the document pack on Supabase Storage
- Sender: thapelol@fundnowcapital.africa
- CCs: info@fundnowcapital.africa

### 9.2 Client welcome email
- Their ref code
- Portal login link
- Document checklist
- POPIA notice

### 9.3 Document request follow-up
- Lists outstanding docs
- One-click upload link

### 9.4 Approval notification
- Congratulations
- Next steps for disbursement

### 9.5 Commission invoice (to funder)
- Auto-generated PDF
- FNC banking details
- VAT breakdown

---

## 10. WEBSITE INTEGRATION

The existing site at `www.fundnowcapital.africa` has Apply buttons. They must all redirect to:
```
https://portal.fundnowcapital.africa/signup?source=website
```

Provide a small JS snippet for the existing site:
```html
<script>
document.querySelectorAll('[data-fnc-apply]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    window.location.href = 'https://portal.fundnowcapital.africa/signup?source=website';
  });
});
</script>
```
And add `data-fnc-apply` to all Apply CTAs.

---

## 11. SECURITY & POPIA REQUIREMENTS

1. ID numbers, bank account numbers — encrypted column (pgcrypto)
2. Supabase project in **EU region**
3. All file uploads stored in Supabase Storage with signed URLs only (no public bucket)
4. RLS enabled on every table
5. Audit log writes on every CREATE / UPDATE / DELETE on `leads`, `businesses`, `documents`, `commissions`
6. POPIA consent timestamp stored on signup
7. Right to delete: admin function that anonymises a client's data (replaces PII with `[REDACTED]` but keeps deal stats for accounting)
8. Session timeout: 30 minutes idle
9. Admin login: email + password + TOTP (Google Authenticator)
10. Client login: email + password + OTP on new device

---

## 12. BUILD ORDER (do these in sequence)

1. **Supabase setup** — create project in EU, apply full schema, enable RLS, create storage buckets, seed `funders` table with the 13 funders
2. **Auth flows** — admin login (email + password + TOTP), client signup (email + SMS OTP via Twilio Verify)
3. **Admin: New Client form** (Section 7) — the 6-step form
4. **Admin: Leads list + Lead detail**
5. **Commission calculator** (Section 5) — standalone page + embedded on lead detail
6. **Funder Submissions** flow — submission record + email generator + signed URL document bundle
7. **Documents** — upload widget (admin + client), checklist tracker
8. **Client portal: signup → onboarding → dashboard → docs → messages**
9. **Dashboard KPIs + Bridgement tier tracker**
10. **Calendar + tasks**
11. **Email templates engine** (Resend.com)
12. **Audit log + POPIA compliance review**
13. **Deploy to Vercel**, point DNS, test end-to-end
14. **Website Apply button redirect**

---

## 13. NON-NEGOTIABLE ACCEPTANCE CRITERIA

The build is NOT done until ALL of these pass:

- [ ] A client can sign up via portal with both SMS OTP and email verification
- [ ] A client can complete the full application and upload all 11 document categories
- [ ] Thapelo can log in to CRM with TOTP
- [ ] Thapelo can add a client manually via the 6-step form and all data lands in correct tables
- [ ] The Commission Calculator returns the correct value for each of the 13 funders given test inputs
- [ ] Bridgement tier auto-progresses when cumulative book size crosses R1M and R4M
- [ ] Submitting a lead to a funder generates a properly formatted email with a working signed URL document bundle
- [ ] Client can see real-time application status updates in their portal
- [ ] All sensitive fields (ID, bank acc) are encrypted in the DB (verify by raw SQL select)
- [ ] RLS prevents Client A from seeing Client B's data (test with two accounts)
- [ ] Audit log captures every change on `leads` and `documents`
- [ ] Apply button on www.fundnowcapital.africa redirects to portal signup
- [ ] CRM works on mobile (Thapelo uses phone often)

---

## 14. WHAT NOT TO DO

- Do NOT use localStorage for any business data (the previous portal failed on this)
- Do NOT make any storage bucket public
- Do NOT hard-code API keys — use Supabase env vars
- Do NOT skip RLS "to test quickly" — enable from day one
- Do NOT use free email like Gmail for outbound — use Resend with the fundnowcapital.africa domain (SPF/DKIM already configured)
- Do NOT add features not in this spec without asking first

---

## 15. POST-LAUNCH TODO (track in CRM as tasks)

- Confirm exact commission rates with Better Banc, GenFin, Growise, Rockfin, Centrafin, Steed Finance, Business Partners (currently estimates)
- Migrate any existing leads from old portal into new system
- Train Marketing iO consultants on consultant referral flow
- Build mobile push notifications for status changes
- Build CSV export for SARS / accounting

---

## 16. V1 SCOPE OVERRIDE (post-spec decision)

**The above spec describes the full v1 vision. The actual v1 build is descoped to admin-only internal CRM:**

### In scope for v1
- Admin login (email + strong password, **NO TOTP**)
- New Client form (6-step, admin manual capture)
- Leads list & detail
- Documents (admin uploads on behalf of clients)
- Funder Submissions with email generator
- Commission Calculator + Tracker
- Bridgement tier auto-progression
- Calendar, Tasks, Dashboard
- All 14 funders seeded (Business Funding counts as the 14th)
- Schema with all tables and RLS policies (client policies written but unused for now)
- Resend for outbound emails
- Audit log
- Mobile-responsive

### Deferred to v2
- Client portal (signup, onboarding, client dashboard, client document upload, status tracker, broker messaging from client side)
- Twilio SMS OTP
- Client email OTP
- Marketing-site Apply button redirect

**Build schema for everything anyway** — all client tables, status fields, message tables — so v2 is a frontend addition only, no schema migration.

---

## 17. VISUAL IDENTITY (match fundnowcapital.africa)

Dark mode only. Teal accents.

**Tailwind custom colours:**
```js
'fnc-dark': '#0A0E1A'
'fnc-dark-card': '#141A28'
'fnc-teal': '#4FD1C5'
'fnc-teal-bright': '#5EE5C5'
'fnc-teal-muted': '#3DC5B0'
'fnc-text': '#FFFFFF'
'fnc-text-muted': '#9CA3AF'
'fnc-border': '#1F2937'
```

**Typography:**
- Headlines: **Playfair Display** (Google Fonts), italic variant for accents (e.g. "Faster")
- Body / UI: **Inter** (Google Fonts)
- All-caps eyebrow labels: Inter, tracking-widest, text-xs, `fnc-teal-muted`

**UI principles:**
- Dark theme default (no light theme)
- Cards: `fnc-dark-card` bg, `rounded-xl`, subtle `fnc-border`
- Primary buttons: `fnc-teal` bg, `fnc-dark` text, `rounded-full`
- Secondary buttons: transparent with `fnc-teal` border + text
- Section dividers: thin gradient lines fading from `fnc-teal` → transparent
- Status badges: teal variants, not red/green primaries (approved = `fnc-teal`, declined = muted grey not red)
- shadcn/ui base colour: `slate`, then overridden with FNC palette

---

**END OF SPEC. Build exactly to this. Ask before deviating.**
