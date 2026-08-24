import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import type { StaffRole } from "@prisma/client";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const staff = await prisma.staffUser.findUnique({ where: { email } });

        if (!staff || !staff.active) {
          return null;
        }

        const valid = await compare(password, staff.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: staff.id,
          email: staff.email,
          name: staff.name,
          role: staff.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as StaffRole;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = token.name as string | null | undefined;
      }
      return session;
    },
  },
});
