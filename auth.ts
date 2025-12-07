import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authService } from "@/services";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (credentials?.emailOrUsername && credentials?.password) {
            const response = await authService.login({
              emailOrUsername: credentials.emailOrUsername as string,
              password: credentials.password as string,
            });

            if (response && response.user) {
              return {
                id: response.user.id,
                email: response.user.email,
                name: response.user.name,
                role: response.user.role || "member",
              };
            }
          }
          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "admin" | "creator" | "member";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.JWT_SECRET,
  trustHost: true,
});
