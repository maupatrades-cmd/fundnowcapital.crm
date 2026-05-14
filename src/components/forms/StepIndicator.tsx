import { cn } from "@/lib/utils";

export type WizardStep = {
  key: string;
  label: string;
};

export function StepIndicator({
  steps,
  current,
  onJump,
}: {
  steps: WizardStep[];
  current: number;
  onJump?: (i: number) => void;
}) {
  return (
    <div className="rounded-xl border border-fnc-border bg-fnc-dark-card p-5">
      <div className="flex items-center justify-between">
        <p className="fnc-eyebrow">
          Step {current + 1} of {steps.length}
        </p>
        <p className="font-serif text-lg text-fnc-text">{steps[current].label}</p>
      </div>
      <div className="mt-4 grid grid-cols-6 gap-2">
        {steps.map((s, i) => {
          const state = i < current ? "done" : i === current ? "active" : "todo";
          return (
            <button
              key={s.key}
              type="button"
              disabled={!onJump || i > current}
              onClick={() => onJump?.(i)}
              className="group flex flex-col items-start gap-1.5 text-left"
            >
              <div
                className={cn(
                  "h-1 w-full rounded-full transition-colors",
                  state === "done" && "bg-fnc-teal",
                  state === "active" && "bg-fnc-teal-bright",
                  state === "todo" && "bg-white/5",
                )}
              />
              <span
                className={cn(
                  "text-[10px] uppercase tracking-widest",
                  state === "todo"
                    ? "text-fnc-text-muted"
                    : state === "active"
                      ? "text-fnc-teal"
                      : "text-fnc-text-muted group-hover:text-fnc-text",
                )}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
