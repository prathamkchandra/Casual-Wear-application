import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Test users for frontend development (database disabled)
const testUsers = [
  { id: "1", email: "user@test.com", password: "password", name: "Test User", role: "user" },
  { id: "2", email: "admin@test.com", password: "admin", name: "Admin", role: "admin" },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        // Test user authentication (database disabled)
        const user = testUsers.find(
          (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
        );
        if (!user || user.password !== credentials.password) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || "user";
      }
      return session;
    },
  },
};
