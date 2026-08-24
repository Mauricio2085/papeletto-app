import type { StaffRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

export type AppSessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: StaffRole;
};

declare module "next-auth" {
  interface User {
    role: StaffRole;
  }

  interface Session {
    user: AppSessionUser & DefaultSession["user"];
  }
}
