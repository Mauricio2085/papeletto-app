/**
 * PrintNode API client (server-only).
 * Implementation lands with the impresión estándar / especial phases.
 */
export type PrintNodeSubmitInput = {
  printerId: string;
  title: string;
  contentType: string;
  content: string;
  copies?: number;
  options?: Record<string, unknown>;
};

export async function submitPrintJob(
  input: PrintNodeSubmitInput,
): Promise<{ jobId: string }> {
  void input;
  throw new Error("PrintNode client not implemented yet");
}
