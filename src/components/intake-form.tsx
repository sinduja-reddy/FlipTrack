"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Storefront = { id: string; name: string; slug: string; category: string };

type FormData = {
  storefrontId: string;
  category: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  subCategory: string;
  condition: string;
  size: string;
  purchasePrice: string;
};

const CONDITION_OPTIONS = [
  "10/10 - Deadstock / Mint",
  "9/10 - Near Mint",
  "8/10 - Excellent",
  "7/10 - Very Good",
  "6/10 - Good",
  "VG+ (Vinyl)",
  "NM (Vinyl)",
  "M (Vinyl)",
  "PSA 10",
  "PSA 9",
  "PSA 8",
  "BGS 9.5",
  "BGS 9",
  "BGS 8.5",
];

const STEPS = ["Storefront", "Item Details", "Review"];

export function IntakeForm({ storefronts }: { storefronts: Storefront[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    storefrontId: "",
    category: "",
    sku: "",
    name: "",
    brand: "",
    model: "",
    subCategory: "",
    condition: "",
    size: "",
    purchasePrice: "",
  });

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleStorefrontChange(id: string) {
    const sf = storefronts.find((s) => s.id === id);
    set("storefrontId", id);
    set("category", sf?.category ?? "");
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storefrontId:  form.storefrontId,
          category:      form.category,
          sku:           form.sku,
          name:          form.name,
          brand:         form.brand,
          model:         form.model,
          subCategory:   form.subCategory || undefined,
          condition:     form.condition,
          size:          form.size || undefined,
          purchasePrice: Number(form.purchasePrice),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create item");
      }

      const item = await res.json();
      router.push(`/intake/${item.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const selectedStorefront = storefronts.find((s) => s.id === form.storefrontId);

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
              ${i < step ? "bg-primary text-primary-foreground"
                : i === step ? "bg-primary text-primary-foreground"
                : "bg-zinc-100 text-zinc-400"}`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-sm ${i === step ? "font-medium" : "text-muted-foreground"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-zinc-200 mx-1" />}
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-white p-6 space-y-5">
        {/* Step 1 — Storefront */}
        {step === 0 && (
          <>
            <h2 className="font-semibold">Select Storefront</h2>
            <div className="grid grid-cols-1 gap-3">
              {storefronts.map((sf) => (
                <button
                  key={sf.id}
                  type="button"
                  onClick={() => handleStorefrontChange(sf.id)}
                  className={`flex items-center justify-between p-4 rounded-lg border text-left transition-colors
                    ${form.storefrontId === sf.id
                      ? "border-primary bg-primary/5"
                      : "border-zinc-200 hover:border-zinc-300"}`}
                >
                  <div>
                    <p className="font-medium">{sf.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sf.category.replace(/_/g, " ")}
                    </p>
                  </div>
                  {form.storefrontId === sf.id && (
                    <span className="text-primary text-sm font-medium">Selected</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2 — Item details */}
        {step === 1 && (
          <>
            <h2 className="font-semibold">Item Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SKU" required>
                <input
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                  placeholder="SV-004"
                  className="input"
                />
              </Field>
              <Field label="Name" required>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Air Jordan 1 Retro High OG"
                  className="input"
                />
              </Field>
              <Field label="Brand" required>
                <input
                  value={form.brand}
                  onChange={(e) => set("brand", e.target.value)}
                  placeholder="Nike"
                  className="input"
                />
              </Field>
              <Field label="Model" required>
                <input
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                  placeholder="Air Jordan 1 Retro High OG"
                  className="input"
                />
              </Field>
              <Field label="Sub-category">
                <input
                  value={form.subCategory}
                  onChange={(e) => set("subCategory", e.target.value)}
                  placeholder="Optional"
                  className="input"
                />
              </Field>
              <Field label="Size">
                <input
                  value={form.size}
                  onChange={(e) => set("size", e.target.value)}
                  placeholder="US 10"
                  className="input"
                />
              </Field>
              <Field label="Condition" required>
                <select
                  value={form.condition}
                  onChange={(e) => set("condition", e.target.value)}
                  className="input"
                >
                  <option value="">Select condition</option>
                  {CONDITION_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Purchase price ($)" required>
                <input
                  type="number"
                  value={form.purchasePrice}
                  onChange={(e) => set("purchasePrice", e.target.value)}
                  placeholder="180"
                  className="input"
                />
              </Field>
            </div>
          </>
        )}

        {/* Step 3 — Review */}
        {step === 2 && (
          <>
            <h2 className="font-semibold">Review</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ReviewRow label="Storefront" value={selectedStorefront?.name ?? ""} />
              <ReviewRow label="Category" value={form.category.replace(/_/g, " ")} />
              <ReviewRow label="SKU" value={form.sku} />
              <ReviewRow label="Name" value={form.name} />
              <ReviewRow label="Brand" value={form.brand} />
              <ReviewRow label="Model" value={form.model} />
              <ReviewRow label="Condition" value={form.condition} />
              {form.size && <ReviewRow label="Size" value={form.size} />}
              <ReviewRow label="Purchase price" value={`$${Number(form.purchasePrice).toLocaleString()}`} />
            </div>
            <p className="text-sm text-muted-foreground pt-2 border-t">
              Submitting will save the item and trigger AI valuation in the background. You'll see the result in seconds.
            </p>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="text-sm font-medium px-4 py-2 rounded-md border bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {step < 2 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={
              (step === 0 && !form.storefrontId) ||
              (step === 1 && (!form.sku || !form.name || !form.brand || !form.model || !form.condition || !form.purchasePrice))
            }
            className="text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Item"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
