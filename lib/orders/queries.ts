import { OrderStatus, type Order, type Asset, type Prisma } from "@prisma/client";
import { startOfTodayBogota } from "@/lib/format/datetime";
import { prisma } from "@/lib/prisma";

export type OrderListFilters = {
  status?: OrderStatus;
  today?: boolean;
  limit?: number;
};

export type OrderListItem = Order & {
  assets: Pick<Asset, "filename" | "pageCount" | "kind">[];
};

const orderListInclude = {
  assets: {
    where: { kind: "original" },
    select: { filename: true, pageCount: true, kind: true },
    take: 1,
  },
} satisfies Prisma.OrderInclude;

export function parseOrderStatusParam(value: string | undefined): OrderStatus | undefined {
  if (!value) {
    return undefined;
  }

  return Object.values(OrderStatus).includes(value as OrderStatus)
    ? (value as OrderStatus)
    : undefined;
}

export async function listOrders(filters: OrderListFilters = {}): Promise<OrderListItem[]> {
  const where: Prisma.OrderWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.today) {
    where.createdAt = { gte: startOfTodayBogota() };
  }

  return prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: filters.limit ?? 100,
    include: orderListInclude,
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      assets: { orderBy: { createdAt: "asc" } },
      printJobs: { orderBy: { createdAt: "desc" } },
    },
  });
}
