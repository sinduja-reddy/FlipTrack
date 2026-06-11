import { StorefrontsService } from "@/lib/storefronts/storefronts.service";
import { IntakeForm } from "@/components/intake-form";

export default async function IntakePage() {
  const storefronts = await StorefrontsService.list();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Item</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Submit an item for AI valuation.
        </p>
      </div>
      <IntakeForm storefronts={storefronts} />
    </div>
  );
}
