"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { retryStandardPrintOrder } from "@/lib/print-standard/confirm-order";

export type RetryPrintState =
  | { ok: true; status: string; printNodeJobId: string | null; dryRun: boolean }
  | { ok: false; error: string }
  | null;

export async function retryPrintOrderAction(
  _prev: RetryPrintState,
  formData: FormData,
): Promise<RetryPrintState> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Debes iniciar sesión." };
  }

  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) {
    return { ok: false, error: "Pedido inválido." };
  }

  try {
    const result = await retryStandardPrintOrder(orderId);
    revalidatePath("/admin");
    revalidatePath(`/admin/orders/${orderId}`);

    if (result.error) {
      return { ok: false, error: result.error };
    }

    return {
      ok: true,
      status: result.status,
      printNodeJobId: result.printNodeJobId,
      dryRun: result.dryRun,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo reintentar la impresión.";
    return { ok: false, error: message };
  }
}
