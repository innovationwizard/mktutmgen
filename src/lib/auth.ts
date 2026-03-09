import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getToken } from "next-auth/jwt";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const input = credentials.username.trim();
        const user = input.includes("@")
          ? await prisma.user.findUnique({ where: { email: input } })
          : await prisma.user.findFirst({
              where: { name: { equals: input, mode: "insensitive" } },
            });

        if (!user || !(await compare(credentials.password, user.passwordHash)))
          return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
};

export async function requireAuth(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return {
    user: {
      id: token.id as string,
      role: token.role as string,
      email: token.email as string,
      name: token.name as string,
    },
  };
}

export async function requireAdmin(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }
  return session;
}
