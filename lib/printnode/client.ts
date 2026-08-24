/**
 * PrintNode API client (server-only).
 * Auth: HTTP Basic with API key as username and empty password.
 */

const PRINTNODE_BASE_URL = "https://api.printnode.com";

export type PrintNodeSubmitInput = {
  printerId: number;
  title: string;
  contentType: "pdf_base64" | "pdf_uri" | "raw_base64" | "raw_uri";
  content: string;
  /** How many times PrintNode should deliver the job (copies). */
  qty?: number;
  source?: string;
  options?: Record<string, unknown>;
};

export type PrintNodeSubmitResult = {
  jobId: string;
  dryRun: boolean;
};

function getApiKey(): string | null {
  const key = process.env.PRINTNODE_API_KEY?.trim();
  return key ? key : null;
}

export function isPrintNodeDryRun(): boolean {
  return process.env.PRINTNODE_DRY_RUN === "1" || process.env.PRINTNODE_DRY_RUN === "true";
}

function authHeader(apiKey: string): string {
  return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
}

export async function submitPrintJob(
  input: PrintNodeSubmitInput,
): Promise<PrintNodeSubmitResult> {
  if (isPrintNodeDryRun()) {
    return {
      jobId: `dry-run-${Date.now()}`,
      dryRun: true,
    };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "PRINTNODE_API_KEY no está configurada. Para probar sin impresora usa PRINTNODE_DRY_RUN=1.",
    );
  }

  const body = {
    printerId: input.printerId,
    title: input.title,
    contentType: input.contentType,
    content: input.content,
    source: input.source ?? "papeletto-app",
    qty: input.qty ?? 1,
    ...(input.options ? { options: input.options } : {}),
  };

  const response = await fetch(`${PRINTNODE_BASE_URL}/printjobs`, {
    method: "POST",
    headers: {
      Authorization: authHeader(apiKey),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `PrintNode respondió ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
    );
  }

  const jobId = await response.json();
  if (typeof jobId !== "number" && typeof jobId !== "string") {
    throw new Error("PrintNode no devolvió un id de job válido.");
  }

  return { jobId: String(jobId), dryRun: false };
}
