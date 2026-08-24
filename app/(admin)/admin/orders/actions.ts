"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  printStandardOrder,
  retryStandardPrintOrder,
} from "@/lib/print-standard/confirm-order";

export type StaffPrintState =
  | { ok: true; status: string; printNodeJobId: string | null; dryRun: boolean }
  | { ok: false; error: string }
  | null;

async function requireStaff(): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Debes iniciar sesión." };
  }
  return { ok: true };
}

function parseOrderId(formData: FormData): string | null {
  const orderId = String(formData.get("orderId") ?? "");
  return orderId || null;
}

export async function printOrderAction(
  _prev: StaffPrintState,
  formData: FormData,
): Promise<StaffPrintState> {
  const staff = await requireStaff();
  if (!staff.ok) {
    return staff;
  }

  const orderId = parseOrderId(formData);
  if (!orderId) {
    return { ok: false, error: "Pedido inválido." };
  }

  try {
    const result = await printStandardOrder(orderId);
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
      error instanceof Error ? error.message : "No se pudo enviar a imprimir.";
    return { ok: false, error: message };
  }
}

export async function retryPrintOrderAction(
  _prev: StaffPrintState,
  formData: FormData,
): Promise<StaffPrintState> {
  const staff = await requireStaff();
  if (!staff.ok) {
    return staff;
  }

  const orderId = parseOrderId(formData);
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
