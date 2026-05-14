-- 011 — Seed 14 funders per SPEC.md §4
insert into public.funders (
  id, name, active, funding_types, min_amount, max_amount, min_turnover,
  min_trading_months, turnaround_hours, commission_basis, commission_rate,
  commission_notes, contact_email, contact_phone, partnership_manager, contract_signed
) values
  ('swype', 'Swype Financial Services', true,
   array['working_capital','merchant_cash_advance'], null, null, null, null, 48,
   'pct_margin', 0.12,
   '12% of margin (future receivables − purchase price). Contract signed 28 April 2026.',
   null, null, null, true),

  ('pollen', 'Pollen Finance', true,
   array['working_capital'], null, null, null, null, 72,
   'pct_interest', 0.10,
   '10% of interest on first deal, 5% recurring for 24 months. Contract signed 28 April 2026.',
   null, null, null, true),

  ('bridgement', 'Bridgement', true,
   array['working_capital','invoice_discounting'], null, null, null, null, 24,
   'tiered_funded', 0.03,
   'Bronze (book < R1M): 3% + R500/approval. Silver (R1M–R4M): 5% + R1,000. Gold (≥R4M): 5.5% + R2,000. Paid first week of month. Currently Bronze.',
   'harry@bridgement.com', '076 700 2532', 'Harry Wheeler', false),

  ('better_banc', 'Better Banc', true,
   array['working_capital'], 20000, 1500000, null, null, 48,
   'pct_funded', 0.03,
   'Flat 3% fee model. Funds R20k–R1.5M. Contact: Renier.',
   null, null, 'Renier', false),

  ('genfin', 'GenFin', true,
   array['working_capital'], null, 5000000, 1000000, null, 24,
   'pct_funded', 0.07,
   'Same-day payout. R1M+ turnover required. R5M max. Rate is estimated — confirm.',
   null, null, null, false),

  ('merchant_capital', 'Merchant Capital', true,
   array['merchant_cash_advance','working_capital'], null, null, null, null, 72,
   'pct_funded', 0.08,
   '8% Tier 1 (VAT inclusive). Tiered by cumulative volume. Tuesday 4pm cutoff. 3-month source rule on unfunded deals. Channel Ops: Jenna Bennett.',
   null, null, 'Jenna Bennett', false),

  ('growise', 'Growise Capital', true,
   array['working_capital','merchant_cash_advance'], null, null, null, null, 72,
   'pct_margin', 0.08,
   'Rate is estimated — confirm.',
   null, null, null, false),

  ('sourcefin', 'Sourcefin', true,
   array['purchase_order_finance','invoice_discounting'], 100000, 50000000, null, null, 72,
   'pct_profit', 0.085,
   'PO + invoice finance. Paid ONLY after supplier delivered AND Sourcefin made profit. 8.5% of Sourcefin profit. R150M backed.',
   null, null, null, false),

  ('rockfin', 'Rockfin', true,
   array['working_capital'], null, null, null, null, 72,
   'pct_funded', 0.06,
   'Working capital. Rate is estimated — confirm.',
   null, null, null, false),

  ('business_partners', 'Business Partners Limited', true,
   array['growth_capital','property_finance'], 500000, 50000000, null, null, 240,
   'pct_funded', 0.02,
   'Growth + property. R500k–R50M. 5–10 day turnaround. Rate is estimated — confirm.',
   null, null, null, false),

  ('centrafin', 'Centrafin', true,
   array['asset_finance'], null, null, null, null, 72,
   'pct_funded', 0.04,
   'Asset & vehicle finance. Rate is estimated — confirm.',
   null, null, null, false),

  ('steed_finance', 'Steed Finance', true,
   array['equipment_finance'], null, null, null, null, 72,
   'pct_funded', 0.04,
   'Equipment finance. Rate is estimated — confirm.',
   null, null, null, false),

  ('unihina', 'Unihina', true,
   array['purchase_order_finance'], null, null, null, null, 72,
   'flat_per_approval', null,
   'Flat fee per approval, capped R500–R5,000. Admin enters fee per deal. Then funds the client.',
   null, null, null, false),

  ('business_funding', 'Business Funding', true,
   array['working_capital','purchase_order_finance','invoice_discounting'], null, null, null, null, 96,
   'pct_their_commission', 0.45,
   '45% of THEIR commission. They use their own funders (Pollen and similar excluded from this route). Profit range R500–R10,000 per deal.',
   null, null, null, false);
