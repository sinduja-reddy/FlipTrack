"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  valuationId: string;
  suggestedLow: number;
  suggestedHigh: number;
  alreadyAccepted: boolean;
  acceptedValue?: number | null;
};

export function AcceptValuation({
  valuationId,
  suggestedLow,
  suggestedHigh,
  alreadyAccepted,
  acceptedValue,
}: Props) {
  const router = useRouter();
  const midpoint = Math.round((suggestedLow + suggestedHigh) / 2);

  const [value, setValue] = useState(String(alreadyAccepted ? acceptedValue ?? midpoint : midpoint));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (alreadyAccepted) {
    return (
      <div className="rounded-md bg-zinc-50 border px-4 py-3 text-sm text-muted-foreground">
        Valuation accepted at{" "}
        <span className="font-medium text-foreground">
          ${Number(acceptedValue).toLocaleString()}
        </span>
        . Item is now in stock.
      </div>
    );
  }

  async function handleAccept() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/valuations/${valuationId}/accept`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptedValue: Number(value), appraiserNote: note || undefined }),
      });

      if (!res.ok) {
        let message = "Failed to accept valuation";
        try {
          const data = await res.json();
          message = data.error ?? message;
        } catch {}
        throw new Error(message);
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Suggested range:{" "}
        <span className="font-medium text-foreground">
          ${suggestedLow.toLocaleString()} – ${suggestedHigh.toLocaleString()}
        </span>
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Accepted value ($)<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Appraiser note</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note"
            className="input"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
      )}

      <button
        type="button"
        onClick={handleAccept}
        disabled={submitting || !value}
        className="text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Accepting..." : "Accept valuation"}
      </button>
    </div>
  );
}
