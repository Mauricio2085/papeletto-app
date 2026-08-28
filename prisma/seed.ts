import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, StaffRole } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const prices = [
  { key: "print.bw.carta.page", amountCents: 200, unit: "page" },
  { key: "print.bw.oficio.page", amountCents: 200, unit: "page" },
  { key: "print.bw.a4.page", amountCents: 200, unit: "page" },
  { key: "print.color.carta.page", amountCents: 500, unit: "page" },
  { key: "print.color.oficio.page", amountCents: 500, unit: "page" },
  { key: "print.color.a4.page", amountCents: 500, unit: "page" },
  { key: "special.10x15", amountCents: 1500, unit: "size" },
  { key: "special.a4", amountCents: 2500, unit: "size" },
  { key: "doc.cv", amountCents: 8000, unit: "document" },
  { key: "doc.derecho_peticion", amountCents: 10000, unit: "document" },
] as const;

async function seedStaff() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@papeletto.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "papeletto-admin";
  const name = process.env.ADMIN_NAME ?? "Admin Papeletto";

  const passwordHash = await hash(password, 12);

  await prisma.staffUser.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: StaffRole.ADMIN,
      active: true,
    },
    create: {
      email,
      name,
      passwordHash,
      role: StaffRole.ADMIN,
      active: true,
    },
  });

  console.log(`Staff admin seeded: ${email}`);
}

async function main() {
  for (const price of prices) {
    await prisma.priceConfig.upsert({
      where: { key: price.key },
      update: {
        amountCents: price.amountCents,
        unit: price.unit,
        active: true,
      },
      create: {
        key: price.key,
        amountCents: price.amountCents,
        unit: price.unit,
        active: true,
      },
    });
  }

  const defaultPrinterId = process.env.PRINTNODE_DEFAULT_PRINTER_ID;
  if (defaultPrinterId) {
    await prisma.printerConfig.upsert({
      where: { printNodePrinterId: defaultPrinterId },
      update: { name: "Impresora principal", isDefault: true, active: true },
      create: {
        name: "Impresora principal",
        printNodePrinterId: defaultPrinterId,
        isDefault: true,
        active: true,
      },
    });
  }

  await seedStaff();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
