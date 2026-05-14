import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";

type Mode = "signin" | "signup";

export function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    if (mode === "signin") {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error, needsConfirm } = await signUp(email, password, fullName);
      if (error) {
        setError(error);
      } else if (needsConfirm) {
        setInfo(
          `Account created. Check ${email} for a confirmation link before signing in.`,
        );
        setMode("signin");
      }
    }
    setSubmitting(false);
  }

  const isSignup = mode === "signup";

  return (
    <div className="grid min-h-screen place-items-center bg-fnc-dark px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-fnc-teal text-fnc-dark">
            <span className="font-serif text-2xl font-bold">F</span>
          </div>
          <p className="fnc-eyebrow mt-5">Fund Now Capital · CRM</p>
          <h1 className="mt-3 font-serif text-4xl text-fnc-text">
            Sign <span className="italic text-fnc-teal">in.</span>
          </h1>
          <p className="mt-2 text-sm text-fnc-text-muted">
            {isSignup
              ? "Create your admin account to get started."
              : "Welcome back. Enter your credentials to continue."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-fnc-border bg-fnc-dark-card p-6 shadow-2xl"
        >
          {isSignup && (
            <div className="mb-4">
              <label className="fnc-eyebrow block">Full Name</label>
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-2 h-11 w-full rounded-lg border border-fnc-border bg-fnc-dark px-3 text-sm text-fnc-text placeholder:text-fnc-text-muted focus:border-fnc-teal focus:outline-none focus:ring-1 focus:ring-fnc-teal"
                placeholder="Thapelo Maupa"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="fnc-eyebrow block">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 h-11 w-full rounded-lg border border-fnc-border bg-fnc-dark px-3 text-sm text-fnc-text placeholder:text-fnc-text-muted focus:border-fnc-teal focus:outline-none focus:ring-1 focus:ring-fnc-teal"
              placeholder="thapelol@fundnowcapital.africa"
            />
          </div>

          <div className="mb-2">
            <label className="fnc-eyebrow block">Password</label>
            <input
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-2 h-11 w-full rounded-lg border border-fnc-border bg-fnc-dark px-3 text-sm text-fnc-text placeholder:text-fnc-text-muted focus:border-fnc-teal focus:outline-none focus:ring-1 focus:ring-fnc-teal"
              placeholder="••••••••"
            />
            {isSignup && (
              <p className="mt-1.5 text-[11px] text-fnc-text-muted">
                Minimum 8 characters.
              </p>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          {info && (
            <div className="mt-4 rounded-lg border border-fnc-teal/30 bg-fnc-teal/5 px-3 py-2 text-sm text-fnc-teal">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 h-11 w-full rounded-full bg-fnc-teal font-medium text-fnc-dark transition-colors hover:bg-fnc-teal-bright disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Working…"
              : isSignup
                ? "Create account"
                : "Sign in"}
          </button>

          <div className="mt-5 text-center text-sm text-fnc-text-muted">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                    setInfo(null);
                  }}
                  className="text-fnc-teal hover:text-fnc-teal-bright"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                First time?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setInfo(null);
                  }}
                  className="text-fnc-teal hover:text-fnc-teal-bright"
                >
                  Create an account
                </button>
              </>
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-[11px] uppercase tracking-widest text-fnc-text-muted">
          POPIA compliant · EU-hosted
        </p>
      </div>
    </div>
  );
}
