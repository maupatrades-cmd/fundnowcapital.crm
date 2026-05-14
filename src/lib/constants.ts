export const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

export const INDUSTRIES = [
  "Construction",
  "Mining",
  "Retail",
  "Wholesale",
  "Manufacturing",
  "Transport & Logistics",
  "Hospitality",
  "Professional Services",
  "Medical & Healthcare",
  "Agriculture",
  "Education",
  "IT & Telecom",
  "Other",
] as const;

export const BANKS = [
  "Absa",
  "FNB",
  "Standard Bank",
  "Nedbank",
  "Capitec",
  "Investec",
  "TymeBank",
  "Bidvest",
  "Other",
] as const;

export const MARITAL_STATUSES = [
  { value: "single", label: "Single" },
  { value: "married_cop", label: "Married (COP)" },
  { value: "married_anc", label: "Married (ANC)" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
] as const;

export const ACCOUNT_TYPES = [
  { value: "cheque", label: "Cheque" },
  { value: "savings", label: "Savings" },
  { value: "business", label: "Business" },
] as const;

export const DIRECTOR_ROLES = [
  { value: "director", label: "Director" },
  { value: "member", label: "Member" },
  { value: "shareholder", label: "Shareholder" },
] as const;

export const FUNDING_TYPES = [
  { value: "working_capital", label: "Working Capital" },
  { value: "merchant_cash_advance", label: "Merchant Cash Advance" },
  { value: "purchase_order_finance", label: "Purchase Order Finance" },
  { value: "invoice_discounting", label: "Invoice Discounting" },
  { value: "asset_finance", label: "Asset Finance" },
  { value: "equipment_finance", label: "Equipment Finance" },
  { value: "property_finance", label: "Property Finance" },
  { value: "bridging_finance", label: "Bridging Finance" },
  { value: "growth_capital", label: "Growth Capital" },
] as const;

export const URGENCY_OPTIONS = [
  { value: "within_24h", label: "Within 24 hours" },
  { value: "one_week", label: "Within 1 week" },
  { value: "two_weeks", label: "Within 2 weeks" },
  { value: "one_month", label: "Within 1 month" },
  { value: "flexible", label: "Flexible" },
] as const;

export const LEAD_SOURCES = [
  { value: "admin_manual", label: "Manual (Admin)" },
  { value: "consultant_referral", label: "Consultant Referral" },
  { value: "marketing_io", label: "Marketing iO" },
  { value: "website_form", label: "Website Form" },
  { value: "client_portal", label: "Client Portal" },
] as const;

export const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

export const DOCUMENT_CATEGORIES = [
  { value: "id_document", label: "South African ID / Passport (all directors)" },
  { value: "proof_of_address", label: "Proof of Address (3 months, all directors)" },
  { value: "bank_statements", label: "6 Months Bank Statements (downloaded PDF)" },
  { value: "cipc_documents", label: "CIPC Documents (CoR14.3, CoR14.1, BBBEE)" },
  { value: "financial_statements", label: "Latest Financial Statements" },
  { value: "management_accounts", label: "Management Accounts (6 months)" },
  { value: "vat_certificate", label: "VAT Certificate (if applicable)" },
  { value: "tax_clearance", label: "Tax Clearance Certificate" },
  { value: "application_form", label: "Signed Application Form (FNC template)" },
  { value: "purchase_order", label: "Purchase Order (if PO finance)" },
  { value: "supplier_quote", label: "Supplier Quote (if PO finance)" },
  { value: "invoice", label: "Customer Invoice (if invoice discounting)" },
] as const;
