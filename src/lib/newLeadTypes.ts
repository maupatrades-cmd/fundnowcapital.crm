export type ClientStep = {
  full_name: string;
  id_number: string;
  phone: string;
  email: string;
  province: string;
  physical_address: string;
  marital_status: string;
};

export type BusinessStep = {
  registered_name: string;
  trading_name: string;
  cipc_number: string;
  vat_number: string;
  industry: string;
  date_business_started: string;
  num_employees: string;
  trading_address: string;
  province: string;
  city: string;
  operating_address: string;
  description: string;
  business_logo_url: string;
};

export type FinancialStep = {
  monthly_turnover: string;
  annual_turnover: string;
  monthly_net_profit: string;
  bank_name: string;
  account_type: string;
  account_holder_name: string;
  bank_account_number: string;
  bank_branch_code: string;
  has_existing_finance: boolean;
  existing_finance_lender: string;
  existing_finance_balance: string;
  existing_finance_monthly: string;
};

export type DirectorEntry = {
  full_name: string;
  id_number: string;
  role: string;
  shareholding_pct: string;
  email: string;
  phone: string;
  is_signatory: boolean;
};

export type FundingStep = {
  funding_type: string;
  funding_amount: string;
  funding_purpose: string;
  urgency: string;
  preferred_term_months: string;
  source: string;
  consultant_id: string;
  notes: string;
  priority: string;
};

export type DocumentUpload = {
  file: File;
  category: string;
};

export type NewLeadForm = {
  client: ClientStep;
  business: BusinessStep;
  financial: FinancialStep;
  directors: DirectorEntry[];
  lead: FundingStep;
  documents: DocumentUpload[];
};

export const emptyClient = (): ClientStep => ({
  full_name: "",
  id_number: "",
  phone: "",
  email: "",
  province: "",
  physical_address: "",
  marital_status: "",
});

export const emptyBusiness = (): BusinessStep => ({
  registered_name: "",
  trading_name: "",
  cipc_number: "",
  vat_number: "",
  industry: "",
  date_business_started: "",
  num_employees: "",
  trading_address: "",
  province: "",
  city: "",
  operating_address: "",
  description: "",
  business_logo_url: "",
});

export const emptyFinancial = (): FinancialStep => ({
  monthly_turnover: "",
  annual_turnover: "",
  monthly_net_profit: "",
  bank_name: "",
  account_type: "",
  account_holder_name: "",
  bank_account_number: "",
  bank_branch_code: "",
  has_existing_finance: false,
  existing_finance_lender: "",
  existing_finance_balance: "",
  existing_finance_monthly: "",
});

export const emptyDirector = (): DirectorEntry => ({
  full_name: "",
  id_number: "",
  role: "director",
  shareholding_pct: "",
  email: "",
  phone: "",
  is_signatory: false,
});

export const emptyFunding = (): FundingStep => ({
  funding_type: "",
  funding_amount: "",
  funding_purpose: "",
  urgency: "",
  preferred_term_months: "",
  source: "admin_manual",
  consultant_id: "",
  notes: "",
  priority: "medium",
});

export const emptyForm = (): NewLeadForm => ({
  client: emptyClient(),
  business: emptyBusiness(),
  financial: emptyFinancial(),
  directors: [emptyDirector()],
  lead: emptyFunding(),
  documents: [],
});
