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
                username: response.user.username,
                role: response.user.role || "member",
                avatar: response.user.avatar || "",
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
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.avatar = user.avatar;
      }

      // Handle session update
      if (trigger === "update" && session) {
        // Update token with new session data
        if (session.user?.role) {
          token.role = session.user.role;
        }
        if (session.user?.avatar !== undefined) {
          token.avatar = session.user.avatar;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "creator" | "member";
        session.user.username = token.username as string;
        session.user.avatar = token.avatar as string;
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
