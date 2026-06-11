import { serve } from "inngest/next";
import { inngest } from "../../../../inngest/client";
import { runAIValuation } from "../../../../inngest/functions/runAIValuation";
import { updateItemStatus } from "../../../../inngest/functions/updateItemStatus";
import { notifyDashboard } from "../../../../inngest/functions/notifyDashboard";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [runAIValuation, updateItemStatus, notifyDashboard],
});
