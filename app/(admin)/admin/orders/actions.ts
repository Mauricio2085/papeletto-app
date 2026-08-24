"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  printStandardOrder,
  retryStandardPrintOrder,
} from "@/lib/print-standard/confirm-order";
import {
  markOrderCompleted,
  markOrderReady,
} from "@/lib/orders/fulfillment";

export type StaffOrderActionState =
  | { ok: true; status: string; message?: string }
  | { ok: false; error: string }
  | null;

/** @deprecated Use StaffOrderActionState */
export type StaffPrintState = StaffOrderActionState;

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
  _prev: StaffOrderActionState,
  formData: FormData,
): Promise<StaffOrderActionState> {
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
      message: result.dryRun
        ? `Enviado (dry-run). Job ${result.printNodeJobId ?? "—"}`
        : result.printNodeJobId
          ? `Enviado. Job ${result.printNodeJobId}`
          : "Enviado a impresora",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo enviar a imprimir.";
    return { ok: false, error: message };
  }
}

export async function retryPrintOrderAction(
  _prev: StaffOrderActionState,
  formData: FormData,
): Promise<StaffOrderActionState> {
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
      message: result.dryRun
        ? `Enviado (dry-run). Job ${result.printNodeJobId ?? "—"}`
        : result.printNodeJobId
          ? `Enviado. Job ${result.printNodeJobId}`
          : "Enviado a impresora",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo reintentar la impresión.";
    return { ok: false, error: message };
  }
}

export async function markOrderReadyAction(
  _prev: StaffOrderActionState,
  formData: FormData,
): Promise<StaffOrderActionState> {
  const staff = await requireStaff();
  if (!staff.ok) {
    return staff;
  }

  const orderId = parseOrderId(formData);
  if (!orderId) {
    return { ok: false, error: "Pedido inválido." };
  }

  try {
    const order = await markOrderReady(orderId);
    revalidatePath("/admin");
    revalidatePath(`/admin/orders/${orderId}`);
    return {
      ok: true,
      status: order.status,
      message: "Pedido marcado como listo para recoger.",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo marcar como listo.";
    return { ok: false, error: message };
  }
}

export async function markOrderCompletedAction(
  _prev: StaffOrderActionState,
  formData: FormData,
): Promise<StaffOrderActionState> {
  const staff = await requireStaff();
  if (!staff.ok) {
    return staff;
  }

  const orderId = parseOrderId(formData);
  if (!orderId) {
    return { ok: false, error: "Pedido inválido." };
  }

  try {
    const order = await markOrderCompleted(orderId);
    revalidatePath("/admin");
    revalidatePath(`/admin/orders/${orderId}`);
    return {
      ok: true,
      status: order.status,
      message: "Pedido marcado como completado.",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo marcar como completado.";
    return { ok: false, error: message };
  }
}
