import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/forms/Field";
import { StepIndicator, type WizardStep } from "@/components/forms/StepIndicator";
import { Step1Personal } from "@/pages/NewLeadSteps/Step1Personal";
import { Step2Business } from "@/pages/NewLeadSteps/Step2Business";
import { Step3Financial } from "@/pages/NewLeadSteps/Step3Financial";
import { Step4Directors } from "@/pages/NewLeadSteps/Step4Directors";
import { Step5Funding } from "@/pages/NewLeadSteps/Step5Funding";
import { Step6Documents } from "@/pages/NewLeadSteps/Step6Documents";
import { emptyForm, type NewLeadForm } from "@/lib/newLeadTypes";
import { supabase } from "@/lib/supabase";

const STEPS: WizardStep[] = [
  { key: "personal", label: "Personal" },
  { key: "business", label: "Business" },
  { key: "financial", label: "Financial" },
  { key: "directors", label: "Directors" },
  { key: "funding", label: "Funding" },
  { key: "documents", label: "Documents" },
];

const STORAGE_KEY = "fnc:newLeadDraft";

function validateStep(form: NewLeadForm, step: number): string | null {
  switch (step) {
    case 0: {
      const c = form.client;
      if (!c.full_name) return "Full name is required.";
      if (!c.id_number || c.id_number.length < 6)
        return "ID number is required (min 6 chars).";
      if (!c.phone) return "Mobile number is required.";
      if (!c.email) return "Email is required.";
      if (!c.province) return "Select a province.";
      return null;
    }
    case 1: {
      const b = form.business;
      if (!b.registered_name) return "Registered business name is required.";
      if (!b.cipc_number) return "CIPC registration number is required.";
      if (!b.industry) return "Select an industry.";
      if (!b.date_business_started) return "Date business started is required.";
      if (!b.province) return "Business province is required.";
      if (!b.city) return "City is required.";
      if (!b.trading_address) return "Trading address is required.";
      return null;
    }
    case 2: {
      const f = form.financial;
      if (!f.monthly_turnover) return "Monthly turnover is required.";
      if (!f.annual_turnover) return "Annual turnover is required.";
      if (!f.bank_name) return "Bank name is required.";
      if (!f.bank_account_number) return "Bank account number is required.";
      return null;
    }
    case 3: {
      if (form.directors.length === 0) return "Add at least one director.";
      for (let i = 0; i < form.directors.length; i++) {
        const d = form.directors[i];
        if (!d.full_name) return `Director #${i + 1}: full name is required.`;
        if (!d.id_number) return `Director #${i + 1}: ID number is required.`;
        if (!d.shareholding_pct) return `Director #${i + 1}: shareholding % is required.`;
      }
      return null;
    }
    case 4: {
      const l = form.lead;
      if (!l.funding_type) return "Select a funding type.";
      if (!l.funding_amount) return "Amount required is required.";
      if (!l.funding_purpose) return "Purpose of funding is required.";
      if (!l.source) return "Select a lead source.";
      return null;
    }
    default:
      return null;
  }
}

function loadDraft(): NewLeadForm | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Omit<NewLeadForm, "documents"> & { documents?: never };
    return { ...parsed, documents: [] };
  } catch {
    return null;
  }
}

export function NewLead() {
  const navigate = useNavigate();
  const [form, setForm] = useState<NewLeadForm>(() => loadDraft() ?? emptyForm());
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const persist = (next: NewLeadForm) => {
    setForm(next);
    // Persist everything except File objects (not serializable)
    const { documents: _docs, ...rest } = next;
    void _docs;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {
      /* quota */
    }
  };

  const next = () => {
    const err = validateStep(form, step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  async function submit() {
    setError(null);
    // Run all step validators
    for (let i = 0; i < STEPS.length - 1; i++) {
      const err = validateStep(form, i);
      if (err) {
        setStep(i);
        setError(err);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        client: form.client,
        business: form.business,
        financial: form.financial,
        directors: form.directors,
        // Merge financial into business for the RPC (server expects flat business object)
        lead: form.lead,
      };
      // Server-side: businesses include financial fields
      const businessWithFinancial = { ...form.business, ...form.financial };

      const { data, error } = await supabase.rpc("create_full_lead", {
        p_payload: {
          ...payload,
          business: businessWithFinancial,
        },
      });

      if (error) throw error;
      const result = data as {
        lead_id: string;
        ref_code: string;
        client_id: string;
        business_id: string;
      };

      // Upload documents
      for (const doc of form.documents) {
        const path = `${result.client_id}/${result.lead_id}/${Date.now()}-${doc.file.name}`;
        const { error: upErr } = await supabase.storage
          .from("client-documents")
          .upload(path, doc.file, { contentType: doc.file.type });
        if (upErr) {
          console.error("Upload failed for", doc.file.name, upErr);
          continue;
        }
        const { error: insErr } = await supabase.from("documents").insert({
          lead_id: result.lead_id,
          business_id: result.business_id,
          client_id: result.client_id,
          category: doc.category,
          document_name: doc.file.name,
          storage_path: path,
          file_size_kb: Math.round(doc.file.size / 1024),
          mime_type: doc.file.type,
        });
        if (insErr) console.error("Document insert failed:", insErr);
      }

      localStorage.removeItem(STORAGE_KEY);
      navigate(`/leads/${result.lead_id}?created=${result.ref_code}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="fnc-eyebrow">New Client + Lead</p>
          <h2 className="mt-1 font-serif text-2xl text-fnc-text">
            Add a <span className="italic text-fnc-teal">client</span>
          </h2>
        </div>
        <Button variant="ghost" onClick={() => navigate("/leads")}>
          Cancel
        </Button>
      </div>

      <StepIndicator
        steps={STEPS}
        current={step}
        onJump={(i) => i <= step && setStep(i)}
      />

      <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-6">
        {step === 0 && (
          <Step1Personal value={form.client} onChange={(v) => persist({ ...form, client: v })} />
        )}
        {step === 1 && (
          <Step2Business value={form.business} onChange={(v) => persist({ ...form, business: v })} />
        )}
        {step === 2 && (
          <Step3Financial value={form.financial} onChange={(v) => persist({ ...form, financial: v })} />
        )}
        {step === 3 && (
          <Step4Directors value={form.directors} onChange={(v) => persist({ ...form, directors: v })} />
        )}
        {step === 4 && (
          <Step5Funding value={form.lead} onChange={(v) => persist({ ...form, lead: v })} />
        )}
        {step === 5 && (
          <Step6Documents value={form.documents} onChange={(v) => setForm({ ...form, documents: v })} />
        )}

        {error && (
          <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={back} disabled={step === 0 || submitting}>
          <ChevronLeft className="mr-1 inline-block h-4 w-4" /> Back
        </Button>
        <div className="text-xs text-fnc-text-muted">
          {step < STEPS.length - 1 ? "Auto-saved · safe to leave and come back" : "Final step"}
        </div>
        {step < STEPS.length - 1 ? (
          <Button variant="primary" onClick={next}>
            Next <ChevronRight className="ml-1 inline-block h-4 w-4" />
          </Button>
        ) : (
          <Button variant="primary" onClick={submit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 inline-block h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create lead"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
